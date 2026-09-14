import { Inject, Injectable } from "@nestjs/common";
import { UploadApiResponse, v2 } from "cloudinary";
import * as streamifier from "streamifier";
import { CLOUDINARY } from "./cloudinary.provider";

@Injectable()
export class CloudinaryService {
    constructor(@Inject(CLOUDINARY) private readonly cloudinaryClient: typeof v2) {}

    async uploadImage(
        file: Express.Multer.File,
        folder = "chiba/products"
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream = this.cloudinaryClient.uploader.upload_stream(
                {
                    folder,
                    resource_type: "image",
                    // Tự động tối ưu chất lượng + format (webp/avif tuỳ trình duyệt)
                    transformation: [{ quality: "auto", fetch_format: "auto" }],
                },
                (error, result) => {
                    if (error || !result) {
                        return reject(error);
                    }
                    resolve(result);
                }
            );

            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        });
    }
}