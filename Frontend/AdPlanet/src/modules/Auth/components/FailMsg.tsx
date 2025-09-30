import { Canvas } from '@react-three/fiber';
import login_fail from '../../../assets/images/login_fail.png';
import Stars from '../../Home/components/Stars';

const FailMsg: React.FC = () => {
  return (
    // 1) 부모 컨테이너에 높이 + relative
    <section className="relative w-screen h-screen"> 
      {/* 2) 캔버스를 부모 전체로 꽉 채우기 */}
      <Canvas className="absolute inset-0 !w-full !h-full" camera={{ position: [0, 0, 10], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} />
        <Stars size={3} />
      </Canvas>

      {/* 3) DOM 오버레이 (부모 relative 기준으로 중앙 정렬) */}
      <div className="font-jamsil absolute inset-0 flex flex-col items-center justify-center gap-2">
        <img 
          src={login_fail} 
          width={400} 
          alt="로그인 실패 이미지" 
          className="animate-float 6s ease-in-out infinite"

        />
        <p className="text-red-400 text-3xl font-semibold pt-12 pb-3">로그인에 실패했습니다</p>
        <p className="text-gray-300 text-lg">잠시 후 홈페이지로 이동합니다...</p>
      </div>
    </section>
  );
};

export default FailMsg;
