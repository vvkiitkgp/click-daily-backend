import Pictures from '../handleActions/pictures.js';

export const uploadPictureByPoseId = async (req, res) => {
  try {
    const pictures = new Pictures();
    const files = req.files;

    // Check if files are uploaded
    if (!files || files.length === 0) {
      console.error(`Error while uploading: Please upload a file`);
      return res
        .status(403)
        .json({ status: false, error: 'Please upload a file' });
    }

    console.log('req.files', files);

    // Prepare media URLs
    const media = files.map((val) => ({
      type: 'image',
      url: 'http://localhost:3000/' + val.filename,
    }));

    req.body.media = media;

    // Handle the upload process
    await pictures.handleUploadPictureByPoseId({
      ...req.body,
      picture: files[0]?.location,
    });

    // Send success response after the upload is handled
    return res.json({
      success: true,
      message: `Uploaded picture successfully`,
      url: files[0]?.location,
    });
  } catch (err) {
    console.error(`Error while creating: ${err.message}`);

    // Send error response if headers are not already sent
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: `Something went wrong! Server error`,
      });
    }
  }
};

export const getAllPicturesByPoseId = async (req, res) => {
  try {
    const pictures = new Pictures();
    const data = await pictures.handleGetAllPicturesByPoseId(req.params.id);

    if (!data) {
      return res.json({
        sucess: false,
        message: `Something Went Wrong!! No Data`,
      });
    }
    res.json({
      sucess: true,
      data,
    });
  } catch (err) {
    res.json({
      sucess: true,
      message: `Something Went Wrong!! server error`,
    });
    console.error(`Error while creating: ${err.message}`);
  }
};

export default {
  uploadPictureByPoseId,
  getAllPicturesByPoseId,
};
