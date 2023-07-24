import { HttpStatus } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { Readable } from 'node:stream';
import { v4 as uuidv4 } from 'uuid';
import { ResponseInterface } from '../http/response/response.interface';

export const uploadFile = async (
  file: Express.Multer.File,
): Promise<ResponseInterface> => {
  try {
    const extname = path.extname(file.originalname);
    const mediaDirName = './media/';
    let isExist = fs.existsSync(mediaDirName);
    if (!isExist) {
      fs.mkdirSync(mediaDirName, { recursive: true });
    }
    let fileName = uuidv4() + extname;
    let writeablePath = path.join(mediaDirName, fileName);
    isExist = fs.existsSync(writeablePath);
    while (isExist) {
      fileName = uuidv4() + extname;
      writeablePath = path.join(mediaDirName, fileName);
      isExist = fs.existsSync(writeablePath);
    }

    const readableStream = Readable.from(file.buffer);
    const writeableStream = fs.createWriteStream(writeablePath, { flags: 'a' });

    readableStream.pipe(writeableStream);

    const imagePath = writeablePath.replace('\\', '/');
    return {
      statusCode: HttpStatus.OK,
      message: 'Successfully uploaded',
      data: {
        imagePath: imagePath,
      },
    };
  } catch (err) {
    throw err;
  }
};
