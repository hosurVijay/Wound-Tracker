const genreteOTP = function () {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000);
    // console.log(otp);
    return otp;
  } catch (error) {
    console.log("Something went wrong while genreating the otp");
  }
};

// genreteOTP();
export { genreteOTP };
