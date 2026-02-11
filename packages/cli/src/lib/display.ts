import chalk from "chalk";
import ora from "ora";

export const brand = {
  gold: chalk.hex("#d4a246"),
  dim: chalk.gray,
  success: chalk.green,
  error: chalk.red,
  info: chalk.cyan,
};

export function header(title: string): void {
  console.error("");
  console.error(brand.gold(`  Dispatch ${title}`));
  console.error(brand.dim("  ─".repeat(20)));
}

export function keyValue(key: string, value: string): void {
  console.error(`  ${brand.dim(key.padEnd(12))} ${value}`);
}

export function createSpinner(text: string) {
  return ora({ text, color: "yellow", stream: process.stderr });
}

export function printCommandError(err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  const withPrefix = message.startsWith("Error:") ? message : `Error: ${message}`;
  console.error(brand.error(`  ${withPrefix}`));
  if (process.env.DEBUG?.includes("dispatch")) console.error(err);
  process.exit(1);
}
