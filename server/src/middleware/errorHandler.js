export const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'ZodError') {
    return res.status(400).json({ success: false, error: 'Validation Error', details: err.errors });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({ success: false, error: 'Unique constraint failed', details: err.meta?.target });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({ success: false, error: 'Record not found' });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, error: 'Invalid token' });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ success: false, error: 'Token expired' });
  }

  res.status(500).json({ success: false, error: 'Internal Server Error' });
};
