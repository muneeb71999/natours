import axios from "axios";
import alertMessage from "./alerts";

export const updatePassword = async (
  oldPassword,
  password,
  passwordConfirm
) => {
  try {
    const res = await axios({
      method: "PATCH",
      url: "http://127.0.0.1:5000/api/v1/users/updateMyPassword",
      data: {
        passwordConfirm,
        password,
        oldPassword,
      },
    });

    if (res.data.status === "success") {
      alertMessage("success", res.data.message);
    }
  } catch (err) {
    alertMessage("error", err.message);
  }
};

export const updateUserData = async (name, email, photo, form) => {
  try {
    const formData = new FormData(form);
    formData.append("photo", photo);
    formData.set("name", name);
    formData.set("email", email);

    const res = await axios({
      method: "PATCH",
      url: "http://127.0.0.1:5000/api/v1/users/updateMe",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      data: formData,
    });

    if (res.data.status === "success") {
      alertMessage("success", res.data.message);
    }
  } catch (err) {
    alertMessage("error", err.message);
  }
};
