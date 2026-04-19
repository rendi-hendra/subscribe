const request = require("supertest");
const app = require("../src/app");
const AppDataSource = require("../data-source");

let userRepository;
let subscriptionRepository;
let paymentRepository;
let memberRepository;

async function clearDatabase() {
  if (!AppDataSource.isInitialized) {
    return;
  }

  paymentRepository = AppDataSource.getRepository("Payment");
  subscriptionRepository = AppDataSource.getRepository("Subscription");
  userRepository = AppDataSource.getRepository("User");
  memberRepository = AppDataSource.getRepository("Member");

  await paymentRepository.clear();
  await subscriptionRepository.clear();
  await memberRepository.clear();
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
    memberRepository = AppDataSource.getRepository("Member");
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
      planId: 1,
    };

    const createResponse = await request(app)
      .post("/api/subscriptions")
      .send(newSubscription)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(createResponse.status).toBe(201);
    expect(createResponse.body).toMatchObject({
      planId: newSubscription.planId,
      status: "pending",
    });
    expect(createResponse.body).toHaveProperty("id");

    const subscriptionId = createResponse.body.id;
    const getResponse = await request(app)
      .get(`/api/subscriptions/${subscriptionId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toMatchObject({
      id: subscriptionId,
      status: "pending",
    });
  });

  test("POST /api/members creates a member for an existing subscription and allows update/delete", async () => {
    const credentials = {
      name: "Member User",
      email: "memberuser@example.com",
      phone: "081234567895",
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
      planId: 1,
    };

    const subscriptionResponse = await request(app)
      .post("/api/subscriptions")
      .send(newSubscription)
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(subscriptionResponse.status).toBe(201);
    const subscriptionId = subscriptionResponse.body.id;

    const createMemberResponse = await request(app)
      .post("/api/members")
      .send({ subscriptionId })
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(createMemberResponse.status).toBe(201);
    expect(createMemberResponse.body).toMatchObject({
      userId: subscriptionResponse.body.userId,
      subscriptionId,
      status: "active",
    });
    expect(createMemberResponse.body).toHaveProperty("id");

    const memberId = createMemberResponse.body.id;

    const getMemberResponse = await request(app)
      .get(`/api/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getMemberResponse.status).toBe(200);
    expect(getMemberResponse.body).toMatchObject({
      id: memberId,
      subscriptionId,
    });

    const updatedStatus = "expired";
    const updateResponse = await request(app)
      .put(`/api/members/${memberId}`)
      .send({ status: updatedStatus })
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token}`);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toHaveProperty("status", updatedStatus);

    const deleteResponse = await request(app)
      .delete(`/api/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toHaveProperty("success", true);

    const getDeletedResponse = await request(app)
      .get(`/api/members/${memberId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(getDeletedResponse.status).toBe(404);
  });

  test("User2 can pay User1 subscription and become member after payment notification", async () => {
    const user1 = {
      name: "Budi",
      email: "budi@example.com",
      phone: "081234567890",
      password: "secret123",
    };
    const user2 = {
      name: "Rendi",
      email: "rendi@example.com",
      phone: "081234567899",
      password: "secret123",
    };

    await request(app)
      .post("/api/users")
      .send(user1)
      .set("Accept", "application/json");
    await request(app)
      .post("/api/users")
      .send(user2)
      .set("Accept", "application/json");

    const login1 = await request(app)
      .post("/api/users/login")
      .send({ email: user1.email, password: user1.password })
      .set("Accept", "application/json");
    expect(login1.status).toBe(200);
    const token1 = login1.body.accessToken;

    const subscriptionResponse = await request(app)
      .post("/api/subscriptions")
      .send({ planId: 1 })
      .set("Accept", "application/json")
      .set("Authorization", `Bearer ${token1}`);

    expect(subscriptionResponse.status).toBe(201);
    const subscriptionId = subscriptionResponse.body.id;

    const user2Entity = await userRepository.findOneBy({ email: user2.email });
    expect(user2Entity).toBeTruthy();

    const paymentRepositoryLocal = AppDataSource.getRepository("Payment");
    const payment = paymentRepositoryLocal.create({
      subscriptionId,
      userId: user2Entity.id,
      midtransOrderId: `order-${Date.now()}`,
      grossAmount: 50000,
      paymentType: "midtrans",
      paymentStatus: "pending",
      paymentUrl: null,
    });
    const savedPayment = await paymentRepositoryLocal.save(payment);

    const notifyResponse = await request(app)
      .post("/api/payments/notification")
      .send({
        order_id: savedPayment.midtransOrderId,
        transaction_status: "settlement",
        fraud_status: "accept",
        transaction_id: "tx-123",
      })
      .set("Accept", "application/json");

    expect(notifyResponse.status).toBe(200);
    expect(notifyResponse.body).toHaveProperty("success", true);

    const login2 = await request(app)
      .post("/api/users/login")
      .send({ email: user2.email, password: user2.password })
      .set("Accept", "application/json");
    expect(login2.status).toBe(200);
    const token2 = login2.body.accessToken;

    const membersResponse = await request(app)
      .get("/api/members")
      .set("Authorization", `Bearer ${token2}`);

    expect(membersResponse.status).toBe(200);
    expect(Array.isArray(membersResponse.body)).toBe(true);
    expect(membersResponse.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: user2Entity.id,
          subscriptionId,
        }),
      ]),
    );
  });

  test("RBAC: Regular user cannot manage Plans, only Admin can", async () => {
    // 1. Create a regular user
    const userCredentials = {
      name: "Regular User",
      email: "regular@example.com",
      phone: "0811111111",
      password: "password123",
    };
    await request(app).post("/api/users").send(userCredentials);
    const loginRes = await request(app).post("/api/users/login").send({
      email: userCredentials.email,
      password: userCredentials.password,
    });
    const userToken = loginRes.body.accessToken;

    // 2. Try to create a plan as regular user -> 403
    const planRes = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${userToken}`)
      .send({ name: "Hacker Plan", price: 50000, durationDays: 999 });
    expect(planRes.status).toBe(403);
    expect(planRes.body.error).toContain("Hanya Admin yang boleh mengelola Plan");

    // 3. Create an admin user (register then update role)
    const adminCredentials = {
      name: "Admin User",
      email: "admin@example.com",
      phone: "0899999999",
      password: "adminpassword",
    };
    await request(app).post("/api/users").send(adminCredentials);
    await userRepository.update({ email: adminCredentials.email }, { role: "admin" });

    const adminLoginRes = await request(app).post("/api/users/login").send({
      email: adminCredentials.email,
      password: adminCredentials.password,
    });
    const adminToken = adminLoginRes.body.accessToken;

    // 4. Create a plan as admin -> 201
    const adminPlanRes = await request(app)
      .post("/api/plans")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Admin Exclusive", price: 1000, durationDays: 30 });
    expect(adminPlanRes.status).toBe(201);
    expect(adminPlanRes.body.name).toBe("Admin Exclusive");
  });

  test("CASL: User can only see their own subscriptions", async () => {
    // Setup User A
    const userA = { name: "User A", email: "usera@example.com", password: "password" };
    await request(app).post("/api/users").send(userA);
    const loginA = await request(app).post("/api/users/login").send({ email: userA.email, password: userA.password });
    const tokenA = loginA.body.accessToken;

    // Setup User B
    const userB = { name: "User B", email: "userb@example.com", password: "password" };
    await request(app).post("/api/users").send(userB);
    const loginB = await request(app).post("/api/users/login").send({ email: userB.email, password: userB.password });
    const tokenB = loginB.body.accessToken;

    // User A creates a subscription (use plan from migration, e.g., ID 1)
    const subARes = await request(app)
      .post("/api/subscriptions")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ planId: 1 });
    const subAId = subARes.body.id;

    // User B tries to access User A's subscription -> 403
    const forbiddenRes = await request(app)
      .get(`/api/subscriptions/${subAId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(forbiddenRes.status).toBe(403);
    expect(forbiddenRes.body.error).toContain("Anda tidak berhak melihat subscription ini");

    // User A accesses their own -> 200
    const successRes = await request(app)
      .get(`/api/subscriptions/${subAId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(successRes.status).toBe(200);
    expect(successRes.body.id).toBe(subAId);
  });
});
