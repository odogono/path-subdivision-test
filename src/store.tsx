import { createContext, PreactProvider } from "preact";
import { useReducer } from "preact/hooks";

export interface State {
  type: "random" | "koch";
  iterations: number;
  variation: number;
  seed: number;
  setIterations: (val: number) => void;
  setVariation: (val: number) => void;
  setSeed: (val: number) => void;
}

export const initialState: State = {
  type: "random",
  iterations: 1,
  variation: 20,
  seed: 1974,
  setIterations: (val: number) => {},
  setVariation: (val: number) => {},
  setSeed: (val: number) => {}
};

export const Context = createContext(initialState);

export interface Action {
  type: "setIterations" | "setVariation" | "setSeed";
  value: any;
}

function reducer(state: State, action: Action) {
  const { type, value } = action;
  switch (type) {
    case "setIterations":
      return { ...state, iterations: value };
    case "setVariation":
      return { ...state, variation: value };
    case "setSeed":
      return { ...state, seed: value };
    default:
      return state;
  }
}

export function Provider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <Context.Provider
      value={{
        ...state,
        setIterations: (value: number) =>
          dispatch({ type: "setIterations", value }),
        setVariation: (value: number) =>
          dispatch({ type: "setVariation", value }),
        setSeed: (value: number) => dispatch({ type: "setSeed", value })
      }}
    >
      {children}
    </Context.Provider>
  );
}
