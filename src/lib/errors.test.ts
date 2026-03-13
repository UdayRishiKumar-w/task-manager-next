import { GraphQLError } from "./errors";

describe("GraphQLError", () => {
  describe("error construction", () => {
    it("creates an error with the provided message", () => {
      const message = "Test error message";
      const error = new GraphQLError(message);
      expect(error.message).toBe(message);
    });

    it("sets the error name to GraphQLError", () => {
      const error = new GraphQLError("Test error");
      expect(error.name).toBe("GraphQLError");
    });

    it("is an instance of Error", () => {
      const error = new GraphQLError("Test error");
      expect(error).toBeInstanceOf(Error);
    });

    it("is an instance of GraphQLError", () => {
      const error = new GraphQLError("Test error");
      expect(error).toBeInstanceOf(GraphQLError);
    });
  });

  describe("error handling", () => {
    it("can be thrown and caught", () => {
      expect(() => {
        throw new GraphQLError("Test error");
      }).toThrow(GraphQLError);
    });

    it("can be caught with specific error message", () => {
      expect(() => {
        throw new GraphQLError("Specific error message");
      }).toThrow("Specific error message");
    });

    it("preserves stack trace", () => {
      const error = new GraphQLError("Test error");
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain("GraphQLError");
    });

    it("can be used in try-catch blocks", () => {
      try {
        throw new GraphQLError("Test error");
      } catch (error) {
        expect(error).toBeInstanceOf(GraphQLError);
        expect((error as GraphQLError).message).toBe("Test error");
      }
    });
  });

  describe("edge cases", () => {
    it("handles empty error message", () => {
      const error = new GraphQLError("");
      expect(error.message).toBe("");
      expect(error.name).toBe("GraphQLError");
    });

    it("handles very long error messages", () => {
      const longMessage = "A".repeat(1000);
      const error = new GraphQLError(longMessage);
      expect(error.message).toBe(longMessage);
      expect(error.message.length).toBe(1000);
    });

    it("handles special characters in error message", () => {
      const message = "Error: <script>alert('xss')</script>";
      const error = new GraphQLError(message);
      expect(error.message).toBe(message);
    });

    it("handles unicode characters in error message", () => {
      const message = "Error: 你好 🚀 Привет";
      const error = new GraphQLError(message);
      expect(error.message).toBe(message);
    });

    it("handles newlines in error message", () => {
      const message = "Line 1\nLine 2\nLine 3";
      const error = new GraphQLError(message);
      expect(error.message).toBe(message);
    });
  });

  describe("error comparison", () => {
    it("different instances with same message are not equal", () => {
      const error1 = new GraphQLError("Test error");
      const error2 = new GraphQLError("Test error");
      expect(error1).not.toBe(error2);
    });

    it("can distinguish GraphQLError from generic Error", () => {
      const graphqlError = new GraphQLError("GraphQL error");
      const genericError = new Error("Generic error");

      expect(graphqlError).toBeInstanceOf(GraphQLError);
      expect(genericError).not.toBeInstanceOf(GraphQLError);
    });

    it("can be identified by name property", () => {
      const error = new GraphQLError("Test error");
      expect(error.name).toBe("GraphQLError");

      const genericError = new Error("Test error");
      expect(genericError.name).toBe("Error");
    });
  });

  describe("error serialization", () => {
    it("can be converted to string", () => {
      const error = new GraphQLError("Test error");
      const errorString = error.toString();
      expect(errorString).toContain("GraphQLError");
      expect(errorString).toContain("Test error");
    });

    it("message property is accessible", () => {
      const message = "Accessible message";
      const error = new GraphQLError(message);
      expect(error.message).toBe(message);
    });

    it("name property is accessible", () => {
      const error = new GraphQLError("Test error");
      expect(error.name).toBe("GraphQLError");
    });
  });
});
