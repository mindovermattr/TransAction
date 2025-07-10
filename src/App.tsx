import { Outlet } from "react-router";
import { Button } from "./components/ui/button";

function App() {
  return (
    <div className="">
      <Outlet />
      <Button className="font-inter">Inter</Button>
    </div>
  );
}

export default App;
