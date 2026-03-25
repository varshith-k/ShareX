import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Upload from "./Upload";

test("renders upload page", () => {
  render(<Upload />);

  const heading = screen.getByText(/Upload File/i);
  expect(heading).toBeInTheDocument();
});

test("renders upload button", () => {
  render(<Upload />);

  const button = screen.getByRole("button", { name: /upload/i });
  expect(button).toBeInTheDocument();
});