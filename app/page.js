"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from 'react';
import Link from 'next/link';

const Home = () => {
  const { data: session, status } = useSession();
  const [savedMaps, setSavedMaps] = useState([]);

  useEffect(() => {
    const fetchMaps = async () => {
      const res = await fetch(`/api/map/${session?.user?.id}`)
      const data = await res.json()
      // console.log('data', data)
      setSavedMaps(data)
    }
    if (status === 'authenticated' && session?.user?.id) {
      fetchMaps()
    }
  }, [status, session]);


  if (status === "loading") {
    return <div>Loading...</div>;
  }

  return (
    <div className="container">
      {!session?.user && (
        <div className="py-5 text-center">
          <h1 className="display-5">
            Welcome to NYCDOT Intersection Automation App!
          </h1>
        </div>
      )}

      {session?.user && (
        <div className="text-start mb-3">
          <p className="fw-bold">Hi, {session.user.name}</p>
        </div>
      )}

      {session?.user && savedMaps.length > 0 && (
        <div className="row">
          <div className="col-md-6">
            <h2>Saved Maps:</h2>
            <ul className="list-group">
              {savedMaps.map((map) => (
                <li key={map.id} className="list-group-item">
                  <Link 
                    href={{
                      pathname: '/map',
                      query: {
                          geocodedData: JSON.parse(map.geocodedLocations),
                          pins: JSON.stringify(map.pins)
                      }
                      }}
                  >
                    {map.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {!session?.user && (
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <div className="alert alert-info" role="alert">
              If you want to use the app for trial, click "Map".
            </div>
            <div className="text-center">
              <a href="/login" className="btn btn-primary mx-2">
                Log In
              </a>
              <a href="/signup" className="btn btn-success mx-2">
                Sign Up
              </a>
              <a href="/map" className="btn btn-info mx-2">
                Map
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;



