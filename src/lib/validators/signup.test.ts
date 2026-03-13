import { signupSchema } from "./signup";

describe("signupSchema", () => {
  describe("valid input acceptance", () => {
    it("accepts valid signup data with all fields", () => {
      const validSignup = {
        name: "John Doe",
        email: "john.doe@example.com",
        password: "securePassword123",
      };

      const result = signupSchema.safeParse(validSignup);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe("John Doe");
        expect(result.data.email).toBe("john.doe@example.com");
        expect(result.data.password).toBe("securePassword123");
      }
    });

    it("accepts valid email with various formats", () => {
      const validEmails = [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
        "user_name@example-domain.com",
      ];

      validEmails.forEach((email) => {
        const result = signupSchema.safeParse({
          name: "Test User",
          email,
          password: "password123",
        });

        expect(result.success).toBe(true);
      });
    });

    it("accepts password with exactly 8 characters", () => {
      const validSignup = {
        name: "Test User",
        email: "test@example.com",
        password: "12345678",
      };

      const result = signupSchema.safeParse(validSignup);

      expect(result.success).toBe(true);
    });

    it("accepts password longer than 8 characters", () => {
      const validSignup = {
        name: "Test User",
        email: "test@example.com",
        password: "thisIsAVeryLongPassword123!",
      };

      const result = signupSchema.safeParse(validSignup);

      expect(result.success).toBe(true);
    });
  });

  describe("invalid input rejection", () => {
    it("rejects signup with empty name", () => {
      const invalidSignup = {
        name: "",
        email: "test@example.com",
        password: "password123",
      };

      const result = signupSchema.safeParse(invalidSignup);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ["name"],
            message: "Name is required",
          }),
        );
      }
    });

    it("rejects signup with invalid email format", () => {
      const invalidEmails = ["notanemail", "missing@domain", "@example.com", "user@", "user @example.com"];

      invalidEmails.forEach((email) => {
        const result = signupSchema.safeParse({
          name: "Test User",
          email,
          password: "password123",
        });

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toContainEqual(
            expect.objectContaining({
              path: ["email"],
              message: "Invalid email address",
            }),
          );
        }
      });
    });

    it("rejects signup with password shorter than 8 characters", () => {
      const invalidSignup = {
        name: "Test User",
        email: "test@example.com",
        password: "1234567",
      };

      const result = signupSchema.safeParse(invalidSignup);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ["password"],
            message: "Password must be at least 8 characters",
          }),
        );
      }
    });

    it("rejects signup missing required name field", () => {
      const invalidSignup = {
        email: "test@example.com",
        password: "password123",
      };

      const result = signupSchema.safeParse(invalidSignup);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("name");
      }
    });

    it("rejects signup missing required email field", () => {
      const invalidSignup = {
        name: "Test User",
        password: "password123",
      };

      const result = signupSchema.safeParse(invalidSignup);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("email");
      }
    });

    it("rejects signup missing required password field", () => {
      const invalidSignup = {
        name: "Test User",
        email: "test@example.com",
      };

      const result = signupSchema.safeParse(invalidSignup);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("password");
      }
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("accepts name with exactly 1 character", () => {
      const signup = {
        name: "A",
        email: "test@example.com",
        password: "password123",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(true);
    });

    it("accepts password with exactly 8 characters (minimum)", () => {
      const signup = {
        name: "Test User",
        email: "test@example.com",
        password: "12345678",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(true);
    });

    it("rejects password with exactly 7 characters (below minimum)", () => {
      const signup = {
        name: "Test User",
        email: "test@example.com",
        password: "1234567",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(false);
    });

    it("accepts name with special characters", () => {
      const signup = {
        name: "O'Brien-Smith Jr.",
        email: "test@example.com",
        password: "password123",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(true);
    });

    it("accepts name with unicode characters", () => {
      const signup = {
        name: "张伟 José María",
        email: "test@example.com",
        password: "password123",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(true);
    });

    it("accepts password with special characters", () => {
      const signup = {
        name: "Test User",
        email: "test@example.com",
        password: "P@ssw0rd!#$%",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(true);
    });

    it("accepts password with spaces", () => {
      const signup = {
        name: "Test User",
        email: "test@example.com",
        password: "pass word 123",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(true);
    });

    it("accepts very long password", () => {
      const signup = {
        name: "Test User",
        email: "test@example.com",
        password: "a".repeat(100),
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(true);
    });

    it("rejects email with spaces", () => {
      const signup = {
        name: "Test User",
        email: "test @example.com",
        password: "password123",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(false);
    });

    it("rejects email without @ symbol", () => {
      const signup = {
        name: "Test User",
        email: "testexample.com",
        password: "password123",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(false);
    });

    it("rejects email without domain", () => {
      const signup = {
        name: "Test User",
        email: "test@",
        password: "password123",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(false);
    });

    it("rejects non-string name", () => {
      const signup = {
        name: 123,
        email: "test@example.com",
        password: "password123",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(false);
    });

    it("rejects non-string email", () => {
      const signup = {
        name: "Test User",
        email: 123,
        password: "password123",
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(false);
    });

    it("rejects non-string password", () => {
      const signup = {
        name: "Test User",
        email: "test@example.com",
        password: 12345678,
      };

      const result = signupSchema.safeParse(signup);

      expect(result.success).toBe(false);
    });
  });
});
