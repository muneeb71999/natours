import axios from "axios";
import alertMessage from "./alerts";

export default async function forgotPassword(email) {
  try {
    const res = await axios({
      method: "POST",
      url: "/api/v1/users/forgotPassword",
      data: {
        email: email,
      },
    });

    if (res.data.status === "success") {
      alertMessage("success", res.data.message);
    }
  } catch (err) {
    alertMessage("error", err.message);
  }
}
