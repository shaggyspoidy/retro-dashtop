#!/usr/bin/env node
import { render, Text } from "ink";
import { h } from "../src/utils/h.js";
import { TitledBox } from "../src/components/TitledBox.js";

render(
  h(TitledBox, { title: "SPEED", width: 24, height: 6 },
    h(Text, null, "content row 1"),
    h(Text, null, "content row 2")
  )
);
