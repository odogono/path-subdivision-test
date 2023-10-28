import { h } from "preact";
import { useContext } from "preact/hooks";
import { Context as AppContext } from "./store";

export function ControlsContainer() {
  const {
    iterations,
    seed,
    variation,
    setIterations,
    setVariation,
    setSeed
  } = useContext(AppContext);

  function handleChangeVariation(evt) {
    const { value } = evt.target;
    setVariation(value);
  }
  function handleChangeIterations(evt) {
    const { value } = evt.target;
    setIterations(value);
  }
  function handleChangeSeed(evt) {
    setSeed(evt.target.value);
  }

  return (
    <div>
      <div>
        <input
          type="range"
          id="variation"
          name="variation"
          min="0"
          max="50"
          value={variation}
          onInput={handleChangeVariation}
        />
        <label for="variation">Variation</label>
      </div>

      <div>
        <input
          type="range"
          id="iterations"
          name="iterations"
          min="0"
          max="10"
          value={iterations}
          onInput={handleChangeIterations}
        />
        <label for="iterations">Iterations</label>
      </div>
      <div>
        <input
          type="range"
          id="seed"
          name="seed"
          min="1974"
          max="2021"
          value={seed}
          onInput={handleChangeSeed}
        />
        <label for="seed">Seed</label>
      </div>
    </div>
  );
}
