"use client"

import VerifyOtp from "@/componenets/VerifyOtp";
import { Suspense } from "react";

const VerifyPage = () => {
    return(
        <Suspense fallback={<div>Loading...</div>}>
            <h1><VerifyOtp/></h1>
        </Suspense>
    )
};

export default VerifyPage