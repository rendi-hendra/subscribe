const request = require("supertest");
const app = require("../src/app");
const AppDataSource = require("../data-source");

let userRepository;
let subscriptionRepository;
let paymentRepository;

async function clearDatabase() {
  if (!AppDataSource.isInitialized) {
    return;
  }

  paymentRepository = AppDataSource.getRepository("Payment");
  subscriptionRepository = AppDataSource.getRepository("Subscription");
  userRepository = AppDataSource.getRepository("User");

  await paymentRepository.clear();
  await subscriptionRepository.clear();
  await userRepository.clear();
}

describe("Subscribe API", () => {
  beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    userRepository = AppDataSource.getRepository("User");
    subscriptionRepository = AppDataSource.getRepository("Subscription");
    paymentRepository = AppDataSource.getRepository("Payment");
    await clearDatabase();
  });

  afterAll(async () => {
    await clearDatabase();
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });

  test("GET /health returns status ok", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("status", "ok");
    expect(response.body).toHaveProperty("uptime");
  });

  test("POST /api/users creates a new user and GET /api/users returns it", async () => {
    const newUser = {
      name: "Test User",
      email: "testuser@example.com",
      phone: "081234567891",
    };

    const createResponse = await request(app)
      .post("/api/users")
      .send(newUser)
      .set("Accept", "application/json");

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
    });
    expect(createResponse.body).toHaveProperty("id");

    const listResponse = await request(app).get("/api/users");
    expect(listResponse.status).toBe(200);
    expect(Array.isArray(listResponse.body)).toBe(true);
    expect(listResponse.body.length).toBeGreaterThanOrEqual(1);
  });

  test("POST /api/users rejects duplicate email with 409", async () => {
    const duplicateUser = {
      name: "Duplicate User",
      email: "testuser@example.com",
      phone: "081234567892",
    };

    const response = await request(app)
      .post("/api/users")
      .send(duplicateUser)
      .set("Accept", "application/json");

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty("error", "Email sudah digunakan");
  });

  test("POST /api/users and /api/users/login returns tokens", async () => {
    const credentials = {
      name: "Auth User",
      email: "authuser@example.com",
      phone: "081234567893",
      password: "secret123",
    };

    const registerResponse = await request(app)
      .post("/api/users")
      .send(credentials)
      .set("Accept", "application/json");

    expect(registerResponse.status).toBe(201);
    expect(registerResponse.body).toHaveProperty("email", credentials.email);
    expect(registerResponse.body).not.toHaveProperty("password");

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({ email: credentials.email, password: credentials.password })
      .set("Accept", "application/json");

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("accessToken");
    expect(loginResponse.body).toHaveProperty("refreshToken");
  });

  test("POST /api/subscriptions creates a subscription and protected GET returns forbidden when pending", async () => {
    const credentials = {
      name: "Pending User",
      email: "pendinguser@example.com",
      phone: "081234567894",
      password: "secret123",
    };

    await request(app)
      .post("/api/users")
      .send(credentials)
      .set("Accept", "application/json");

    const loginResponse = await request(app)
      .post("/api/users/login")
      .send({ email: credentials.email, password: credentials.password })
      .set("Accept", "application/json");

    const token = loginResponse.body.accessToken;
    expect(token).toBeTruthy();

    const newSubscription = {
      planName: "Basic Plan",
      price: 50000,
    };

    const createResponse = await request(app)
      .post("/api/subscriptions")
      .send(newSubscription)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      planName: newSubscription.planName,
      status: "pending",
    });
    expect(createResponse.body).toHaveProperty("id");

    const subscriptionId = createResponse.body.id;
    const getResponse = await request(app)
      .get(`/api/subscriptions/${subscriptionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.status).toBe(403);
    expect(getResponse.body).toHaveProperty(
      "error",
      "Akses forbidden. Subscription belum aktif atau sudah kadaluarsa",
    );
  });
});
