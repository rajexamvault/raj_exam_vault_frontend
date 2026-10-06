import examService from "./examService";

export const studyMaterialService = {
  getMaterials: examService.getMaterials,
  getMaterialById: examService.getMaterialById,
  uploadMaterialFile: examService.uploadMaterialFile,
  createMaterial: examService.createMaterial,
  updateMaterial: examService.updateMaterial,
  deleteMaterial: examService.deleteMaterial,
  trackDownload: examService.trackDownload,
  trackView: examService.trackView
};

export default studyMaterialService;
