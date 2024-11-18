import fs from 'fs';
import { getPicturesFromPoseId, uploadPicture } from './utils/pictures.js';

class Pictures {
  constructor(filename = 'pictures.json') {
    this.path = `./data/${filename}`;

    try {
      fs.readdirSync('data');
    } catch (err) {
      fs.mkdirSync('data');
    }

    try {
      fs.accessSync(this.path);
    } catch (err) {
      fs.writeFileSync(this.path, '[]');
    }
  }

  createId() {
    // TODO: add unix id here let's not use time as id
    return new Date().getTime().toString();
  }

  async handleUploadPictureByPoseId(data) {
    // const totalData = await this.handleGetAllPictures();
    // totalData.push(data);
    // await fs.promises.writeFile(this.path, JSON.stringify(totalData, null, 2));
    await uploadPicture(data);
  }

  async handleGetAllPicturesByPoseId(id) {
    const picturesList = await getPicturesFromPoseId(id);
    return picturesList;
  }
}

export default Pictures;
