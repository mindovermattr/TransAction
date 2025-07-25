import { getUserFromLS } from "@/lib/localstorage";
import { redirect } from "react-router";

const protectedLoader = async () => {
  const user = getUserFromLS();
  if (!user) {
    return redirect("/login");
  }
  return;
};

export { protectedLoader };
