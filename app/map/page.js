"use client";

import Map from '@components/Map';

import { useState, useEffect } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import Link from "next/link";
import { useSearchParams } from 'next/navigation'


const map = () => {
    const [pins, setPins] = useState([]); 
    const [geocodedLocations, setGeocodedLocations] = useState([]);
    const searchParams = useSearchParams(); 

    useEffect(() => {
        const coordinates = searchParams.get('geocodedData');
        if (coordinates){
            setGeocodedLocations(coordinates);
        }
    }, [searchParams.get('geocodedData')])

    useEffect(() => {
        const p = searchParams.get('pins');
        if (p){
            const temp = JSON.parse(p);
            setPins(temp);
        }
        
    }, [searchParams.get('pins')])


    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
    })
    if (!isLoaded) {
        return <div> Loading... </div>
    }
    return (
        <>
        <Map geocodedLocations={geocodedLocations} old_pins={pins} />
        <Link href="/geocoding"> 
        <button className='btn btn-warning'>Import Intersctions</button>
        </Link>
        </>
    )
        
}
 
export default map;