const { createClient } = require("@supabase/supabase-js");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Returns a chainable builder where the FINAL step returns a real Promise
function makeQueryBuilder() {
  // We keep state if you ever want to inspect it later (optional)
  const state = {
    table: null,
    select: null,
    filters: [],
  };

  // Helper that returns the final Promise result
  const exec = () => Promise.resolve({ data: [], error: null });

  const qb = {
    _state: state,

    select(columns) {
      state.select = columns;
      return qb;
    },

    // In your code, you do: .select(...).eq(...)
    // So make eq() return a REAL Promise so `await` works.
    eq(column, value) {
      state.filters.push({ op: "eq", column, value });
      return exec();
    },

    // If your code uses ilike/order/limit after select, support them too.
    // If any of these are the last call, they should return a Promise too,
    // but usually they chain into another call.
    ilike(column, value) {
      state.filters.push({ op: "ilike", column, value });
      return qb;
    },

    order(column, opts) {
      state.order = { column, opts };
      return qb;
    },

    limit(n) {
      state.limit = n;
      return qb;
    },

    // Sometimes code calls .single() at end
    single() {
      return Promise.resolve({ data: null, error: null });
    },

    insert() {
      return Promise.resolve({ data: [], error: null });
    },

    update() {
      return Promise.resolve({ data: [], error: null });
    },

    upsert() {
      return Promise.resolve({ data: [], error: null });
    },

    delete() {
      return Promise.resolve({ data: [], error: null });
    },
  };

  return qb;
}

function makeStub() {
  return {
    from(table) {
      const qb = makeQueryBuilder();
      qb._state.table = table;
      return qb;
    },
    auth: {
      signInWithPassword: async () => ({ data: null, error: null }),
      signUp: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
    },
  };
}

const supabase = url && key ? createClient(url, key) : makeStub();
module.exports = supabase;