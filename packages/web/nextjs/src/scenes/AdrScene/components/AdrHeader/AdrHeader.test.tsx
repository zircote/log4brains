import { AdrDtoStatus } from "@log4brains/core";
import React from "react";
import TestRenderer, { act } from "react-test-renderer";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { AdrHeader } from "./AdrHeader";

function renderWithTheme(element: React.ReactElement) {
  let tree: TestRenderer.ReactTestRenderer | undefined;
  void act(() => {
    tree = TestRenderer.create(
      <ThemeProvider theme={createTheme()}>{element}</ThemeProvider>
    );
  });
  if (!tree) {
    throw new Error("Failed to render component");
  }
  return tree;
}

describe("AdrHeader", () => {
  it("renders correctly with deciders", () => {
    const tree = renderWithTheme(
      <AdrHeader
        adr={{
          slug: "test",
          package: "",
          title: "Test",
          status: "draft" as AdrDtoStatus,
          supersededBy: null,
          tags: [],
          deciders: ["John Doe", "Lorem Ipsum", "Ipsum Dolor"],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test",
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: null,
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md",
          },
        }}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders correctly without deciders", () => {
    const tree = renderWithTheme(
      <AdrHeader
        adr={{
          slug: "test",
          package: "",
          title: "Test",
          status: "draft" as AdrDtoStatus,
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test",
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: null,
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md",
          },
        }}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders correctly with package", () => {
    const tree = renderWithTheme(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "draft" as AdrDtoStatus,
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test",
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: null,
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md",
          },
        }}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders correctly with tags", () => {
    const tree = renderWithTheme(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "draft" as AdrDtoStatus,
          supersededBy: null,
          tags: ["foo", "bar"],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test",
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: null,
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md",
          },
        }}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("renders correctly with publication date", () => {
    const tree = renderWithTheme(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "accepted" as AdrDtoStatus,
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test",
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: new Date(2020, 0, 2).toJSON(),
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md",
          },
        }}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("shows the Github repository button", () => {
    const tree = renderWithTheme(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "accepted" as AdrDtoStatus,
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test",
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: new Date(2020, 0, 2).toJSON(),
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md",
          },
          repository: {
            provider: "github",
            viewUrl: "https://github.com/xxx",
          },
        }}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("shows the Gitlab repository button", () => {
    const tree = renderWithTheme(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "accepted" as AdrDtoStatus,
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test",
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: new Date(2020, 0, 2).toJSON(),
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md",
          },
          repository: {
            provider: "gitlab",
            viewUrl: "https://gitlab.com/xxx",
          },
        }}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("shows the generic repository button", () => {
    const tree = renderWithTheme(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "accepted" as AdrDtoStatus,
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test",
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: new Date(2020, 0, 2).toJSON(),
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md",
          },
          repository: {
            provider: "generic",
            viewUrl: "https://foo.com/xxx",
          },
        }}
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });

  it("shows the locally edit button", () => {
    const tree = renderWithTheme(
      <AdrHeader
        adr={{
          slug: "test",
          package: "test",
          title: "Test",
          status: "accepted" as AdrDtoStatus,
          supersededBy: null,
          tags: [],
          deciders: [],
          body: {
            enhancedMdx: "# Test",
            rawMarkdown: "#Test",
          },
          creationDate: new Date(2020, 0, 1).toJSON(),
          lastEditDate: new Date(2020, 0, 1).toJSON(),
          lastEditAuthor: "John Doe",
          publicationDate: new Date(2020, 0, 2).toJSON(),
          file: {
            relativePath: "test.md",
            absolutePath: "/test.md",
          },
          repository: {
            provider: "generic",
            viewUrl: "https://foo.com/xxx",
          },
        }}
        locallyEditable
      />
    );
    expect(tree.toJSON()).toMatchSnapshot();
  });
});
