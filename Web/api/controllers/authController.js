const supabase = require('../supabase');

// SIGN UP
exports.signUp = async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return res.status(400).json({ error: error.message });
    res.status(201).json({ message: "User created! Check your email for verification.", data });
  } catch (err) {
    res.status(500).json({ error: "Server error during signup" });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) return res.status(400).json({ error: error.message });
  res.status(200).json({ message: "Logged out successfully" });
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;
  
  // This checks the credentials against the database
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return res.status(401).json({ error: "Invalid login credentials" });
  }

  // data.session contains the JWT token the frontend needs
  res.status(200).json({ message: "Login successful", session: data.session });
};