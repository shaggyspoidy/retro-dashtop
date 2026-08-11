#!/usr/bin/env node

/**
 * @fileoverview Application entry point.
 * Mounts the main React App component into the Ink terminal engine.
 */

import { render } from 'ink';
import { h } from './utils/h.js';
import { App } from './App.js';

// Clear the terminal to give the dashboard a clean slate
console.clear();

// Mount the app!
render(h(App));
