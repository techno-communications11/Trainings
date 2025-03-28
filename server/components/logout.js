const logout = async (req, res) => {
  try {
    // Clear the HTTP-only cookie
    res.clearCookie('token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
      sameSite: 'strict', // Prevent CSRF attacks
      path: '/' // Ensure the cookie is cleared for all paths
    });

    // Optional: Clear additional site data (browser-specific)
    res.setHeader('Clear-Site-Data', '"cookies", "storage"');

    // Respond with success
    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to log out'
    });
  }
};

module.exports = logout;