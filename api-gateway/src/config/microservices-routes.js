module.exports = [
    { route: "/categories", target: "http://localhost:5001/categories" },
    { route: "/items", target: "http://localhost:5001/items" },
    { route: "/catalogs", target: "http://localhost:5001/catalogs" },
    { route: "/orders", target: "http://localhost:5004/orders" },
    { route: "/orders-items", target: "http://localhost:5004/orders-items" },
    { route: "/payments", target: "http://localhost:5005/payments" },
    { route: "/surcharges", target: "http://localhost:5005/surcharges" },
    { route: "/payments-surcharges", target: "http://localhost:5005/payments-surcharges" },
    { route: "/tables", target: "http://localhost:5006/tables" },
    { route: "/auth", target: "http://localhost:5007/auth" },
    { route: "/users", target: "http://localhost:5007/users" },
    { route: "/roles", target: "http://localhost:5007/roles" }
]