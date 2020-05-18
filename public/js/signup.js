import axios from "axios";
import alertMessage from "./alerts";

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/signup",
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    // if (res.data.status === "success") {
    //   alertMessage("success",);
    // }
    if (res.data.status === "success") {
      alertMessage("success", res.data.message);
      setTimeout(() => {
        location.assign("/");
      }, 1000);
    }
  } catch (error) {
    alertMessage("error", error.message);
  }
};
