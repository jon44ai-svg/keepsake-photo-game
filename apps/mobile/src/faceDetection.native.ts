import FaceDetection from "@react-native-ml-kit/face-detection"

export async function detectFaces(uri: string): Promise<number> {
  return (await FaceDetection.detect(uri)).length
}
