"use client";
import React from 'react';
import AdminControls from '../AdminControls';
import BannerUpload from '@/components/admin/edit/BannerUpload';

const Edit = () => {
    return (
        <AdminControls>
            <BannerUpload />
        </AdminControls>
    );
};

export default Edit;
