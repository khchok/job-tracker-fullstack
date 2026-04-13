import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthorRibbon from "../AuthorRibbon";

// next/image doesn't work in jsdom — mock it to a plain <img>
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props: React.ImgHTMLAttributes<HTMLImageElement> & { src: string; alt: string }) => {
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

jest.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogTitle: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

describe("AuthorRibbon", () => {
  it("renders the pill button with 'About' label", () => {
    render(<AuthorRibbon />);
    expect(screen.getByRole("button", { name: /about the author/i })).toBeInTheDocument();
    expect(screen.getByText("About")).toBeInTheDocument();
  });

  it("opens the modal when the pill is clicked", async () => {
    const user = userEvent.setup();
    render(<AuthorRibbon />);

    // Modal content not visible before click
    expect(screen.queryByText("Chok Khar Hui")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /about the author/i }));

    // Modal content visible after click
    expect(screen.getByText("Chok Khar Hui")).toBeInTheDocument();
    expect(screen.getByText("Software Engineer")).toBeInTheDocument();
  });

  it("modal contains all contact links", async () => {
    const user = userEvent.setup();
    render(<AuthorRibbon />);
    await user.click(screen.getByRole("button", { name: /about the author/i }));

    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute(
      "href",
      "https://github.com/khchok"
    );
    expect(screen.getByRole("link", { name: /linkedin/i })).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/khar-hui-chok-96a852203"
    );
    expect(screen.getByRole("link", { name: /email/i })).toHaveAttribute(
      "href",
      "mailto:chok072056@gmail.com"
    );
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute(
      "href",
      "https://wa.me/60182586282"
    );
  });
});
