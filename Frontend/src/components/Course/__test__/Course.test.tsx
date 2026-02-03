import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { Course } from "../Course";

describe("Course Component", () => {
  const mockCourse = {
    id: 1,
    name: "React Fundamentals",
    description: "Learn the fundamentals of React framework",
    thumbnail: "https://example.com/thumbnail.jpg",
    average_rating: 4.5,
    total_ratings: 10,
  };

  it("renders course information correctly", () => {
    render(<Course {...mockCourse} />);

    // Check if name is rendered
    expect(screen.getByText(mockCourse.name)).toBeDefined();

    // Check if description is rendered
    expect(screen.getByText(mockCourse.description)).toBeDefined();
  });

  it("renders thumbnail with correct alt text", () => {
    render(<Course {...mockCourse} />);

    const thumbnail = screen.getByAltText(mockCourse.name);
    expect(thumbnail).toHaveAttribute("src", mockCourse.thumbnail);
    expect(thumbnail).toHaveAttribute("alt", mockCourse.name);
  });

  it("renders rating when available", () => {
    render(<Course {...mockCourse} />);

    // Check if rating section is rendered
    const ratingContainer = screen.getByText(/\(\d+\)/); // Matches rating count like "(10)"
    expect(ratingContainer).toBeDefined();
  });

  it("does not render rating when not available", () => {
    const courseWithoutRating = { ...mockCourse, average_rating: undefined, total_ratings: undefined };
    const { container } = render(<Course {...courseWithoutRating} />);

    // Rating container should not exist
    const ratingContainer = container.querySelector('[class*="ratingContainer"]');
    expect(ratingContainer).toBeNull();
  });

  it("renders with correct structure", () => {
    const { container } = render(<Course {...mockCourse} />);

    // Check if the main article exists
    expect(container.querySelector("article")).toBeDefined();

    // Check if the thumbnail container exists
    expect(container.querySelector("div > img")).toBeDefined();

    // Check if the course info section exists
    expect(container.querySelector("div > h2")).toBeDefined();
    expect(container.querySelector("div > p")).toBeDefined();
  });
});
