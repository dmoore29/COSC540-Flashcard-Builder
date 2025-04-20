import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import YourDecks from "../../components/YourDecks"
import axios from "axios";

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock API call
jest.mock("axios");

describe("YourDecks Component", () => {
    beforeEach(() => {
        global.confirm = jest.fn(() => true); 
      });
  test("renders loading state initially", () => {
    render(<YourDecks user={{ email: "test@example.com" }} />);
    expect(screen.getByText("Loading your decks...")).toBeInTheDocument();
  });


  test("renders message when no decks are found", async () => {
    axios.get.mockResolvedValue({ data: [] }); // Mock API response
    render(<YourDecks user={{ email: "test@example.com" }} />);
    
    await waitFor(() => expect(screen.getByText("You haven't created any decks yet")).toBeInTheDocument());
  });
  

  test("renders a deck when available", async () => {
    axios.get.mockResolvedValue({ data: [{ _id: "1", name: "Sample Deck", cardIds: [1, 2] }] });

    render(<YourDecks user={{ email: "test@example.com" }} />);
    
    await waitFor(() => expect(screen.getByText("Sample Deck")).toBeInTheDocument());
    expect(screen.getByText("2 cards")).toBeInTheDocument();
  });

  test("handles deck deletion", async () => {
    axios.delete.mockResolvedValue({});
    axios.get.mockResolvedValue({ data: [{ _id: "1", name: "Sample Deck", cardIds: [1, 2] }] });

    render(<YourDecks user={{ email: "test@example.com" }} />);

    await waitFor(() => expect(screen.getByText("Sample Deck")).toBeInTheDocument());

    const deleteButton = screen.getByText("Delete");
    userEvent.click(deleteButton);

    await waitFor(() => expect(screen.queryByText("Sample Deck")).not.toBeInTheDocument());
  });
});