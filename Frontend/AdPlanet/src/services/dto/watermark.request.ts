export interface WatermarkDetectionReq{
    image:File;
}

export const toFormData=(req:WatermarkDetectionReq):FormData=>{
    const formData=new FormData();
    formData.append("image",req.image);

    return formData;
}
