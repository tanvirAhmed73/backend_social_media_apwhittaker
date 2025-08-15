import { Injectable } from "@nestjs/common";
import appConfig from "src/config/app.config";

@Injectable()
export class FileService{

    static generateAvatarUrl(fileName: string): string {
        return `${appConfig().app.backEndUrl}${appConfig().storageUrl.rootUrlPublic}${appConfig().storageUrl.avatar}/${fileName}`;
    }

    static generateImageUrl(fileName: string): string {
    return `${appConfig().app.backEndUrl}${appConfig().storageUrl.rootUrlPublic}${appConfig().storageUrl.pictures}/${fileName}`;
  }
    
  static generateVideoUrl(fileName: string): string {
    return `${appConfig().app.backEndUrl}${appConfig().storageUrl.rootUrlPublic}${appConfig().storageUrl.videos}/${fileName}`;
  }
}