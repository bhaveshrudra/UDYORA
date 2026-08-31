import React from'react';

export interface BrandLogoProps {
 size?:'sm' |'md' |'lg' |'xl';
 variant?:'light' |'dark' |'auto';
 compact?: boolean;
 showTagline?: boolean;
 logoSrc?: string;
 className?: string;
 onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
 size ='md',
 variant ='auto',
 compact = false,
 showTagline = true,
 logoSrc,
 className ='',
 onClick
}) => {
 // Dimensions map for logo symbol
 const sizeMap = {
 sm: {
 box:'w-8 h-8 rounded-lg text-sm',
 title:'text-base font-bold',
 tagline:'text-[10px]'
 },
 md: {
 box:'w-10 h-10 rounded-xl text-lg',
 title:'text-xl font-black',
 tagline:'text-[11px]'
 },
 lg: {
 box:'w-12 h-12 rounded-2xl text-xl',
 title:'text-2xl font-black',
 tagline:'text-xs'
 },
 xl: {
 box:'w-16 h-16 rounded-2xl text-2xl',
 title:'text-3xl font-black',
 tagline:'text-sm'
 }
 };

 const isDark = variant ==='dark';
 const textColor = isDark ?'text-white' :'text-slate-950';
 const subTextColor = isDark ?'text-slate-400' :'text-slate-500';

 return (
 <div
 onClick={onClick}
 className={`inline-flex items-center gap-3 select-none ${onClick ?'cursor-pointer' :''} ${className}`}
 >
 {/* 1. Official Logo Image or High-Precision Brand Mark Fallback */}
 <div className="relative shrink-0 flex items-center justify-center">
 {logoSrc ? (
 <img
 src={logoSrc}
 alt="UDYORA - Hyper-Local Business Intelligence"
 className={`${sizeMap[size].box} object-contain`}
 />
 ) : (
 <div
 className={`${sizeMap[size].box} bg-slate-900 text-white flex items-center justify-center font-black shadow-xs border border-slate-700 tracking-wider relative overflow-hidden`}
 >
 {/* Top Micro Accent Line */}
 <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-blue-500 to-emerald-400" />
 <span>U</span>
 </div>
 )}
 </div>

 {/* 2. Brand Name & Descriptive Tagline */}
 {!compact && (
 <div className="flex flex-col justify-center leading-tight">
 <span className={`${sizeMap[size].title} tracking-tight ${textColor} block`}>
 UDYORA
 </span>
 {showTagline && (
 <p className={`${sizeMap[size].tagline} ${subTextColor} font-semibold tracking-normal mt-0.5 hidden sm:block`}>
 Hyper-Local Business Intelligence for Rural Entrepreneurs
 </p>
 )}
 </div>
 )}
 </div>
 );
};
