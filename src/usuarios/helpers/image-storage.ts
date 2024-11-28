import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";

import fs = require("fs");

import path = require("path");

const validMimeType = ['image/png', 'image/jpg', 'image/jpeg', 'image/jpeg'];


export const saveImagesToStorage = (destination) => {
  return {
    storage: diskStorage({
      destination: `./uploads/${destination}`,
      filename: (req, file, callback) => {
        const fileExtension: string = path.extname(file.originalname);
        const filename: string = uuidv4() + fileExtension;
        callback(null, filename);
      },
    }),
    fileFilter: (req, file, callback) => {
      const allowedMimeTypes = validMimeType;
      allowedMimeTypes.includes(file.mimetype)
        ? callback(null, true)
        : callback(null, false);
    },
  };
};

//! Update file function
export const removeFiles = (fullFilePath: string) => {
  try {
    fs.unlinkSync(fullFilePath);
  } catch (e) {
    console.error(e);
  }
};

/**export const saveImagesToStorage = (destination) => {
    return {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const uploadPath = `./uploads/${destination}`;
                if (!fs.existsSync(uploadPath)) {
                    fs.mkdirSync(uploadPath, { recursive: true });
                }
                cb(null, uploadPath)
            }, 
            filename: (req, file, callback) => {
                const fileExtension: string = path.extname(file.originalname);
                const filename: string = uuidv4() + fileExtension;
                callback(null, filename);
            },
        }),
        fileFilter: (req, file, callback) => {
            const allowedMimeTypes = validMimeType;
            allowedMimeTypes.includes(file.mimetype)
                ? callback(null, true)
                : callback(null, false);
        }
    }
};
export const removeFiles = (fullFilePath: string) => {
    try {
        fs.unlinkSync(fullFilePath);
    } catch (err) {
        console.error(new Date(), err);
    }
} */