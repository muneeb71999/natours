import axios from "axios";
import alertMessage from "./alerts";

export default async function resetPassword(password, passwordConfirm, token) {
  try {
    const res = await axios({
      method: "PATCH",
      url: `/api/v1/users/resetPassword/${token}`,
      data: {
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === "success") {
      alertMessage("success", res.data.message);
    }
  } catch (err) {
    alertMessage("error", err.message);
  }
}
