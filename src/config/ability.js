const { AbilityBuilder, Ability } = require("@casl/ability");

function defineAbilitiesFor(user) {
  const { can, cannot, build } = new AbilityBuilder(Ability);

  if (user.role === "admin") {
    can("manage", "all"); // Admin can do anything
  } else {
    // User abilities
    can("read", "Plan"); // Users can see plans
    
    // User can manage their own subscriptions
    can("read", "Subscription", { userId: user.id });
    can("create", "Subscription");
    can("update", "Subscription", { userId: user.id });
    
    // User can manage their own member records
    can("read", "Member", { userId: user.id });
    can("manage", "Member", { userId: user.id });

    // Users cannot manage plans
    cannot("manage", "Plan");
  }

  return build();
}

module.exports = { defineAbilitiesFor };
