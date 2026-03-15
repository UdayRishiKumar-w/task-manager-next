import { loginSchema } from "@/lib/validators/auth";

describe("loginSchema", () => {
  describe("valid input acceptance", () => {
    it("accepts valid login credentials", () => {
      const validLogin = {
        email: "user@example.com",
        password: "myPassword",
      };

      const result = loginSchema.safeParse(validLogin);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
        expect(result.data.password).toBe("myPassword");
      }
    });

    it("accepts various valid email formats", () => {
      const validEmails = [
        "user@example.com",
        "user.name@example.com",
        "user+tag@example.co.uk",
        "user_name@example-domain.com",
      ];

      validEmails.forEach((email) => {
        const result = loginSchema.safeParse({
          email,
          password: "password",
        });

        expect(result.success).toBe(true);
      });
    });

    it("accepts any non-empty password", () => {
      const validLogin = {
        email: "user@example.com",
        password: "a",
      };

      const result = loginSchema.safeParse(validLogin);

      expect(result.success).toBe(true);
    });
  });

  describe("invalid input rejection", () => {
    it("rejects login with invalid email format", () => {
      const invalidEmails = ["notanemail", "missing@domain", "@example.com", "user@", "user @example.com"];

      invalidEmails.forEach((email) => {
        const result = loginSchema.safeParse({
          email,
          password: "password",
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

    it("rejects login with empty password", () => {
      const invalidLogin = {
        email: "user@example.com",
        password: "",
      };

      const result = loginSchema.safeParse(invalidLogin);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(
          expect.objectContaining({
            path: ["password"],
            message: "Password is required",
          }),
        );
      }
    });

    it("rejects login missing required email field", () => {
      const invalidLogin = {
        password: "password",
      };

      const result = loginSchema.safeParse(invalidLogin);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("email");
      }
    });

    it("rejects login missing required password field", () => {
      const invalidLogin = {
        email: "user@example.com",
      };

      const result = loginSchema.safeParse(invalidLogin);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0]?.path).toContain("password");
      }
    });
  });

  describe("edge cases and boundary conditions", () => {
    it("accepts password with exactly 1 character", () => {
      const login = {
        email: "user@example.com",
        password: "a",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(true);
    });

    it("accepts password with special characters", () => {
      const login = {
        email: "user@example.com",
        password: "P@ssw0rd!#$%^&*()",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(true);
    });

    it("accepts password with spaces", () => {
      const login = {
        email: "user@example.com",
        password: "pass word with spaces",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(true);
    });

    it("accepts very long password", () => {
      const login = {
        email: "user@example.com",
        password: "a".repeat(1000),
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(true);
    });

    it("accepts email with subdomain", () => {
      const login = {
        email: "user@mail.example.com",
        password: "password",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(true);
    });

    it("accepts email with plus sign", () => {
      const login = {
        email: "user+tag@example.com",
        password: "password",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(true);
    });

    it("accepts email with dots in local part", () => {
      const login = {
        email: "first.last@example.com",
        password: "password",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(true);
    });

    it("rejects email with spaces", () => {
      const login = {
        email: "user @example.com",
        password: "password",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(false);
    });

    it("rejects email without @ symbol", () => {
      const login = {
        email: "userexample.com",
        password: "password",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(false);
    });

    it("rejects email without domain", () => {
      const login = {
        email: "user@",
        password: "password",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(false);
    });

    it("rejects email without local part", () => {
      const login = {
        email: "@example.com",
        password: "password",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(false);
    });

    it("rejects non-string email", () => {
      const login = {
        email: 123,
        password: "password",
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(false);
    });

    it("rejects non-string password", () => {
      const login = {
        email: "user@example.com",
        password: 123,
      };

      const result = loginSchema.safeParse(login);

      expect(result.success).toBe(false);
    });
  });
});
