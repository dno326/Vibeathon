#!/bin/bash
# Run both frontend and backend in parallel
cd frontend && npm start &
cd backend && python -m flask run &
wait

