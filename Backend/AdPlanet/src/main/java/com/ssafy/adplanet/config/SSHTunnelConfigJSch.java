package com.ssafy.adplanet.config;

import com.jcraft.jsch.*;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.persistence.EntityManagerFactory;
import javax.sql.DataSource;
import java.io.File;
import java.util.Arrays;

@Slf4j
@Configuration
public class SSHTunnelConfigJSch {

    @Value("${ssh.host}")
    private String sshHost;

    @Value("${ssh.username}")
    private String sshUsername;

    @Value("${ssh.private-key-path}")
    private String privateKeyPath;

    @Value("${rds.host}")
    private String rdsHost;

    @Value("${rds.port}")
    private int rdsPort;

    @Value("${db.port}")
    private int localPort;

    private Session session;

    @Bean
    public static BeanFactoryPostProcessor dataSourceDependsOnSshTunnel() {
        return (ConfigurableListableBeanFactory bf) -> {
            for (String name : bf.getBeanNamesForType(DataSource.class, true, false)) {
                BeanDefinition bd = bf.getBeanDefinition(name);
                bd.setDependsOn(appendDependsOn(bd.getDependsOn(), "SSHTunnelConfigJSch"));
            }
            for (String name : bf.getBeanNamesForType(EntityManagerFactory.class, true, false)) {
                BeanDefinition bd = bf.getBeanDefinition(name);
                bd.setDependsOn(appendDependsOn(bd.getDependsOn(), "SSHTunnelConfigJSch"));
            }
        };
    }

    private static String[] appendDependsOn(String[] current, String beanName) {
        if (current == null || current.length == 0) return new String[]{beanName};
        String[] next = Arrays.copyOf(current, current.length + 1);
        next[next.length - 1] = beanName;
        return next;
    }

    @PostConstruct
    public void createSSHTunnel() {
        try {
            JSch jsch = new JSch();

            // PEM 키 파일 확인
            File keyFile = new File(privateKeyPath);
            if (!keyFile.exists()) {
                throw new RuntimeException("PEM 키 파일을 찾을 수 없습니다: " + privateKeyPath);
            }

            // 개인 키 추가
            log.info("개인 키 파일 로드 중: {}", privateKeyPath);
            jsch.addIdentity(privateKeyPath);

            // 호스트 키 확인 비활성화 (개발용)
            jsch.setConfig("StrictHostKeyChecking", "no");

            // SSH 세션 생성
            log.info("SSH 세션 생성: {}@{}:22", sshUsername, sshHost);
            session = jsch.getSession(sshUsername, sshHost, 22);

            // 연결 옵션 설정
            session.setConfig("PreferredAuthentications", "publickey");
            session.setConfig("ServerAliveInterval", "60");
            session.setConfig("ServerAliveCountMax", "3");

            // SSH 연결
            log.info("SSH 서버 연결 중...");
            session.connect(30000); // 30초 타임아웃

            if (session.isConnected()) {
                log.info("SSH 세션 연결 성공");

                // 포트 포워딩 설정
                log.info("포트 포워딩 설정 중: localhost:{} -> {}:{}", 
                        localPort, rdsHost, rdsPort);
                
                int assignedPort = session.setPortForwardingL(localPort, rdsHost, rdsPort);
                
                log.info("SSH 터널 설정 완료 - 포트: {}", assignedPort);
            } else {
                throw new RuntimeException("SSH 세션 연결 실패");
            }

        } catch (JSchException e) {
            log.error("SSH 터널 생성 실패: {}", e.getMessage());
            throw new RuntimeException("SSH 터널 생성 실패", e);
        } catch (Exception e) {
            log.error("SSH 터널 생성 중 예상치 못한 오류 발생", e);
            throw new RuntimeException("SSH 터널 생성 실패", e);
        }
    }

    @PreDestroy
    public void closeSSHTunnel() {
        try {
            if (session != null && session.isConnected()) {
                session.disconnect();
                log.info("SSH 세션 연결 해제");
            }
        } catch (Exception e) {
            log.error("SSH 터널 종료 중 오류 발생", e);
        }
    }
}