const bearerSecurityScheme = {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
};

export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Booking API",
    version: "1.0.0",
    description: "Etkinlik rezervasyonu, rol bazlı yetkilendirme ve expiry worker içeren backend API.",
  },
  servers: [
    {
      url: "/",
      description: "Current environment",
    },
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags: [
    { name: "Health", description: "Servis sağlık kontrolü" },
    { name: "Auth", description: "Kayıt ve giriş işlemleri" },
    { name: "Events", description: "Etkinlik okuma ve yönetim işlemleri" },
    { name: "Bookings", description: "Rezervasyon akışları" },
    { name: "Payments", description: "Mock payment sonuçları" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: bearerSecurityScheme,
    },
    schemas: {
      ErrorResponse: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: {
              code: { type: "string", example: "VALIDATION_ERROR" },
              message: { type: "string", example: "İstek doğrulanamadı." },
              details: { type: "object", additionalProperties: true },
            },
            required: ["code", "message"],
          },
        },
        required: ["error"],
      },
      RegisterRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "customer@example.com" },
          password: { type: "string", minLength: 8, example: "password123" },
        },
        required: ["email", "password"],
      },
      RegisterResponse: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              id: { type: "string", example: "cm123" },
              email: { type: "string", format: "email" },
              role: { type: "string", enum: ["ADMIN", "CUSTOMER"] },
              createdAt: { type: "string", format: "date-time" },
            },
            required: ["id", "email", "role", "createdAt"],
          },
        },
        required: ["user"],
      },
      LoginRequest: {
        type: "object",
        properties: {
          email: { type: "string", format: "email", example: "customer@example.com" },
          password: { type: "string", example: "password123" },
        },
        required: ["email", "password"],
      },
      LoginResponse: {
        type: "object",
        properties: {
          accessToken: { type: "string", example: "jwt-token" },
          tokenType: { type: "string", example: "Bearer" },
          expiresIn: { type: "string", example: "1h" },
        },
        required: ["accessToken", "tokenType", "expiresIn"],
      },
      EventRequest: {
        type: "object",
        properties: {
          title: { type: "string", example: "Konser Gecesi" },
          description: { type: "string", nullable: true, example: "Açık hava performansı" },
          location: { type: "string", example: "Istanbul" },
          startsAt: { type: "string", format: "date-time" },
          endsAt: { type: "string", format: "date-time" },
          totalCapacity: { type: "integer", minimum: 1, example: 250 },
          status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
        },
        required: ["title", "location", "startsAt", "endsAt", "totalCapacity"],
      },
      EventResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              id: { type: "string" },
              title: { type: "string" },
              description: { type: "string", nullable: true },
              location: { type: "string" },
              startsAt: { type: "string", format: "date-time" },
              endsAt: { type: "string", format: "date-time" },
              totalCapacity: { type: "integer" },
              availableCapacity: { type: "integer" },
              status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
              deletedAt: { type: "string", format: "date-time", nullable: true },
            },
            required: [
              "id",
              "title",
              "location",
              "startsAt",
              "endsAt",
              "totalCapacity",
              "availableCapacity",
              "status",
              "createdAt",
              "updatedAt",
            ],
          },
        },
        required: ["data"],
      },
      EventListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                title: { type: "string" },
                description: { type: "string", nullable: true },
                location: { type: "string" },
                startsAt: { type: "string", format: "date-time" },
                endsAt: { type: "string", format: "date-time" },
                totalCapacity: { type: "integer" },
                availableCapacity: { type: "integer" },
                status: { type: "string", enum: ["ACTIVE", "INACTIVE"] },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
              required: [
                "id",
                "title",
                "location",
                "startsAt",
                "endsAt",
                "totalCapacity",
                "availableCapacity",
                "status",
                "createdAt",
                "updatedAt",
              ],
            },
          },
        },
        required: ["data"],
      },
      BookingResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              id: { type: "string" },
              userId: { type: "string" },
              eventId: { type: "string" },
              status: { type: "string", enum: ["PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"] },
              reservedAt: { type: "string", format: "date-time" },
              expiresAt: { type: "string", format: "date-time" },
              confirmedAt: { type: "string", format: "date-time", nullable: true },
              cancelledAt: { type: "string", format: "date-time", nullable: true },
              createdAt: { type: "string", format: "date-time" },
              updatedAt: { type: "string", format: "date-time" },
            },
            required: [
              "id",
              "userId",
              "eventId",
              "status",
              "reservedAt",
              "expiresAt",
              "createdAt",
              "updatedAt",
            ],
          },
        },
        required: ["data"],
      },
      BookingListResponse: {
        type: "object",
        properties: {
          data: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "string" },
                userId: { type: "string" },
                eventId: { type: "string" },
                status: { type: "string", enum: ["PENDING", "CONFIRMED", "CANCELLED", "EXPIRED"] },
                reservedAt: { type: "string", format: "date-time" },
                expiresAt: { type: "string", format: "date-time" },
                confirmedAt: { type: "string", format: "date-time", nullable: true },
                cancelledAt: { type: "string", format: "date-time", nullable: true },
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
              required: [
                "id",
                "userId",
                "eventId",
                "status",
                "reservedAt",
                "expiresAt",
                "createdAt",
                "updatedAt",
              ],
            },
          },
        },
        required: ["data"],
      },
      PaymentResultResponse: {
        type: "object",
        properties: {
          data: {
            type: "object",
            properties: {
              bookingId: { type: "string" },
              provider: { type: "string", enum: ["MOCK"] },
              status: { type: "string", enum: ["PENDING", "SUCCESS", "FAILED"] },
              providerReference: { type: "string" },
              checkedAt: { type: "string", format: "date-time" },
            },
            required: ["bookingId", "provider", "status", "providerReference", "checkedAt"],
          },
        },
        required: ["data"],
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Servis sağlık kontrolü",
        responses: {
          "200": {
            description: "Servis ayakta",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    service: { type: "string", example: "booking-api" },
                  },
                  required: ["status", "service"],
                },
              },
            },
          },
        },
      },
    },
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Yeni kullanıcı kaydı oluşturur",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Kullanıcı oluşturuldu",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RegisterResponse" },
              },
            },
          },
          "400": {
            description: "Doğrulama hatası",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "E-posta zaten kayıtlı",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Kullanıcı girişi yapar",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "JWT token üretildi",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/LoginResponse" },
              },
            },
          },
          "400": {
            description: "Doğrulama hatası",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Geçersiz giriş bilgileri",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/events": {
      get: {
        tags: ["Events"],
        summary: "Aktif etkinlikleri listeler",
        responses: {
          "200": {
            description: "Etkinlik listesi",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventListResponse" },
              },
            },
          },
        },
      },
      post: {
        tags: ["Events"],
        summary: "Yeni etkinlik oluşturur",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/EventRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Etkinlik oluşturuldu",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventResponse" },
              },
            },
          },
          "400": {
            description: "Doğrulama hatası",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Kimlik doğrulama gerekli",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Admin yetkisi gerekli",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/events/{id}": {
      get: {
        tags: ["Events"],
        summary: "Aktif etkinlik detayını getirir",
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Etkinlik detayı",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventResponse" },
              },
            },
          },
          "404": {
            description: "Etkinlik bulunamadı",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      patch: {
        tags: ["Events"],
        summary: "Etkinliği günceller",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                allOf: [{ $ref: "#/components/schemas/EventRequest" }],
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Etkinlik güncellendi",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/EventResponse" },
              },
            },
          },
          "400": {
            description: "Doğrulama veya kapasite hatası",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "401": {
            description: "Kimlik doğrulama gerekli",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Admin yetkisi gerekli",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Etkinlik bulunamadı",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
      delete: {
        tags: ["Events"],
        summary: "Etkinliği soft delete ile pasife alır",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "204": {
            description: "Etkinlik pasife alındı",
          },
          "401": {
            description: "Kimlik doğrulama gerekli",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Admin yetkisi gerekli",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Etkinlik bulunamadı",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/events/{id}/bookings": {
      post: {
        tags: ["Bookings"],
        summary: "Etkinlik için rezervasyon oluşturur",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
              },
            },
          },
        },
        responses: {
          "201": {
            description: "Rezervasyon oluşturuldu",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BookingResponse" },
              },
            },
          },
          "401": {
            description: "Kimlik doğrulama gerekli",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "403": {
            description: "Yalnızca customer rezervasyon açabilir",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Etkinlik rezervasyona uygun değil",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/me/bookings": {
      get: {
        tags: ["Bookings"],
        summary: "Kullanıcının kendi rezervasyonlarını listeler",
        security: [{ bearerAuth: [] }],
        responses: {
          "200": {
            description: "Rezervasyon listesi",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BookingListResponse" },
              },
            },
          },
          "401": {
            description: "Kimlik doğrulama gerekli",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/bookings/{id}/cancel": {
      patch: {
        tags: ["Bookings"],
        summary: "Rezervasyonu iptal eder",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: "path",
            name: "id",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                additionalProperties: false,
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Rezervasyon iptal edildi",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/BookingResponse" },
              },
            },
          },
          "401": {
            description: "Kimlik doğrulama gerekli",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "404": {
            description: "Rezervasyon bulunamadı",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
          "409": {
            description: "Rezervasyon iptal edilemez durumda",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
              },
            },
          },
        },
      },
    },
    "/mock-payments/{bookingId}": {
      get: {
        tags: ["Payments"],
        summary: "Deterministik mock payment sonucunu döner",
        parameters: [
          {
            in: "path",
            name: "bookingId",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Mock payment sonucu",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PaymentResultResponse" },
              },
            },
          },
        },
      },
    },
  },
};
