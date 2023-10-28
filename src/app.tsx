import "./styles.css";

import { Provider as AppProvider } from "./store";
import { ControlsContainer } from "./controls";
import { Canvas } from "./canvas";

export function App() {
  return (
    <AppProvider>
      <div className="app">
        <Canvas />
        <ControlsContainer />
      </div>
    </AppProvider>
  );
}
