import { useState, useEffect } from 'react';
import { ref, onValue, update, set, push } from 'firebase/database';
import database from '../firebase';
import NewsTicker from './NewsTicker';
import HeatMapContainer from './HeatMap';
import './index.css';

const clubsAndBars = [
  'The Owl San Diego',
  'Mavericks Beach Club',
  'Nova SD',
  'Hideaway',
  'PB Shore Club',
  'Parq',
  'The Duck Dive',
  'Side Bar',
  'Phantom Lounge and Nightclub',
  'The Casbah',
  'The Rail',
  'Oxford Social Club',
  'The Tipsy Crow',
  'Onyx',
  'F6ix',
  'Bloom',
  'Omertà',
  'Sevilla',
  'Mr Tempo',
  'TORO',
  'Prohibition Lounge',
  'Spin',
  'Moonshine Flats',
  '710 Beach Club',
  'Lahaina Beach House',
  'PB Avenue',
  'Moonshine Beach',
  'Thrusters Lounge',
  'The Local',
  'Open Bar',
  'Tavern at the Beach',
  'Silver Fox Lounge',
  'The Collective',
  'Firehouse',
  'Nolita Hall',
  'Camino Riviera',
  'Waterfront',
  'Waterbar',
  'Beachcomber',
  'Sidecar',
  'Park & Rec',
  'American Junkie',
  'Lafayette'
];

// Map club names to their location URLs (update with your actual links)
const clubLocations = {
  'The Owl San Diego': 'https://www.google.com/maps/dir//420+E+St,+San+Diego,+CA+92101/@32.7147923,-117.2430872,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80d9534cb0a81c6d:0x5019f947b72d2e76!2m2!1d-117.160686!2d32.7148192?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Mavericks Beach Club': 'https://www.google.com/maps/dir//860+Garnet+Ave,+San+Diego,+CA+92109/@32.7969665,-117.33696,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80dc01ed4a33ca67:0xe5ccf145c43dc856!2m2!1d-117.2545606!2d32.79694?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Nova SD': 'https://www.google.com/maps/dir//NOVA+SD,+Sixth+Avenue,+San+Diego,+CA/@32.7101391,-117.200703,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80d953f3984d8373:0xb88af52513d84244!2m2!1d-117.1594389!2d32.7103071?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Hideaway': 'https://www.google.com/maps/dir//4474+Mission+Blvd,+San+Diego,+CA+92109/@32.7961665,-117.3379473,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80dc01001f5b1d7f:0x668aa995fcd00ddf!2m2!1d-117.2555461!2d32.7961935?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'PB Shore Club': 'https://www.google.com/maps/dir//4343+Ocean+Blvd,+San+Diego,+CA+92109/@32.7941901,-117.3382093,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80dc01f27f56f293:0x97c43960eb48a464!2m2!1d-117.2558081!2d32.7942171?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Parq': 'https://www.google.com/maps?rlz=1C5CHFA_enUS920US923&gs_lcrp=EgZjaHJvbWUqFggBEC4YgwEYrwEYxwEYsQMYgAQYjgUyEAgAEAAYgwEY4wIYsQMYgAQyFggBEC4YgwEYrwEYxwEYsQMYgAQYjgUyEAgCEC4YrwEYxwEYgAQYjgUyCQgDEAAYChiABDINCAQQABiSAxiABBiKBTINCAUQABiSAxiABBiKBTIJCAYQABgKGIAEMg0IBxAAGIMBGLEDGIAEMgcICBAAGI8CMgcICRAAGI8C0gEIMjU1MGowajeoAgCwAgA&um=1&ie=UTF-8&fb=1&gl=us&sa=X&geocode=KYMRw4OnVNmAMZCeW4E7HeND&daddr=615+Broadway,+San+Diego,+CA+92101',
  'The Duck Dive': 'https://www.google.com/maps/dir//4650+Mission+Blvd,+San+Diego,+CA+92109/@32.7985183,-117.3387285,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80dc018d6698aebd:0x4cbe323a6529d2b8!2m2!1d-117.2562648!2d32.7985589?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Side Bar': 'https://www.google.com/maps/dir//Side+Bar,+6th+St,+San+Diego,+CA/@32.711662,-117.2006022,13z/data=!3m1!5s0x80d95359a4e152fb:0xf3c479bdd8d3d169!4m8!4m7!1m0!1m5!1m1!1s0x80d95359a4f71dad:0xd2b90b558faaa352!2m2!1d-117.1594024!2d32.7116687?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Phantom Lounge and Nightclub': 'https://www.google.com/maps/dir//Phantom+Lounge+and+Nightclub,+Fifth+Avenue,+San+Diego,+CA/@32.7161033,-117.2015132,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80d954a7eb148127:0x44196b16bdd29423!2m2!1d-117.1603191!2d32.7161098?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'The Casbah': 'https://www.google.com/maps/dir//2501+Kettner+Blvd,+San+Diego,+CA+92101/@32.7302243,-117.254322,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80d954b4e0c59087:0x9856d4b4f58e630d!2m2!1d-117.1719232!2d32.7302504?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'The Rail': 'https://www.google.com/maps/dir//The+Rail,+Fifth+Avenue,+San+Diego,+CA/@32.7468236,-117.2019392,13z/data=!3m1!5s0x80d954daba064b2d:0xfac8d05b29e51124!4m8!4m7!1m0!1m5!1m1!1s0x80d954dab76bd2c1:0x1a9b56ef49ce662!2m2!1d-117.1607394!2d32.7468303?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Oxford Social Club': 'https://www.google.com/maps/dir//Oxford+Social+Club,+Fifth+Avenue,+San+Diego,+CA/@32.7099353,-117.2011073,13z/data=!3m1!5s0x80d954daba064b2d:0xfac8d05b29e51124!4m8!4m7!1m0!1m5!1m1!1s0x80d953598b01edd1:0x70fd57ffd095aa19!2m2!1d-117.1599652!2d32.7099594?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'The Tipsy Crow': 'https://www.google.com/maps/dir//The+Tipsy+Crow,+Fifth+Avenue,+San+Diego,+CA/@32.7134629,-117.2015364,13z/data=!3m2!4b1!5s0x80d954daba064b2d:0xfac8d05b29e51124!4m8!4m7!1m0!1m5!1m1!1s0x80d953584079c39f:0x6b62100a8ea8f55b!2m2!1d-117.1603229!2d32.7134995?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Onyx': 'https://www.google.com/maps/dir//Onyx+Nightclub,+Fifth+Avenue,+San+Diego,+CA/@32.7143675,-117.2015212,13z/data=!3m2!4b1!5s0x80d954daba064b2d:0xfac8d05b29e51124!4m8!4m7!1m0!1m5!1m1!1s0x80d9535872cb4d5f:0xb235e251e95ae194!2m2!1d-117.1603214!2d32.7143742?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'F6ix': 'https://www.google.com/maps/dir//F6ix,+F+Street,+San+Diego,+CA/@32.7137283,-117.2008865,13z/data=!3m2!4b1!5s0x80d954daba064b2d:0xfac8d05b29e51124!4m8!4m7!1m0!1m5!1m1!1s0x80d9535842863f95:0xd8e8315e4f2df1f0!2m2!1d-117.1596867!2d32.713735?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Bloom': 'https://www.google.com/maps/dir//Bloom+Nightclub,+Fourth+Avenue,+San+Diego,+CA/@32.7147662,-117.2018293,13z/data=!3m2!4b1!5s0x80d954daba064b2d:0xfac8d05b29e51124!4m8!4m7!1m0!1m5!1m1!1s0x80d955738175f68b:0xa29e164aa485c40b!2m2!1d-117.1606295!2d32.7147729?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Omertà': 'https://www.google.com/maps/dir//Omert%C3%A0,+Fifth+Avenue,+San+Diego,+CA/@32.7133939,-117.2011198,13z/data=!3m2!4b1!5s0x80d954daba064b2d:0xfac8d05b29e51124!4m8!4m7!1m0!1m5!1m1!1s0x80d953f3e4c03593:0x3cf954846d4d86f7!2m2!1d-117.15992!2d32.7134006?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Sevilla': 'https://www.google.com/maps/dir//Sevilla+Nightclub+of+San+Diego,+Fifth+Avenue,+San+Diego,+CA/@32.7089068,-117.2008934,13z/data=!3m2!4b1!5s0x80d954daba064b2d:0xfac8d05b29e51124!4m8!4m7!1m0!1m5!1m1!1s0x80d9535a3bb8a035:0xf32dbb01a11ac53a!2m2!1d-117.1597593!2d32.708913?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Mr Tempo': 'https://www.google.com/maps/dir//Mr+Tempo+Gaslamp+San+Diego,+Fifth+Avenue,+San+Diego,+CA/@32.7127076,-117.2011452,13z/data=!3m2!4b1!5s0x80d954daba064b2d:0xfac8d05b29e51124!4m8!4m7!1m0!1m5!1m1!1s0x80d95367ff5b792d:0x14eca75f6af381a8!2m2!1d-117.1599454!2d32.7127143?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'TORO': 'https://www.google.com/maps/dir//TORO,+Fifth+Avenue,+San+Diego,+CA/@32.7124125,-117.2016055,13z/data=!3m2!4b1!5s0x80d954daba064b2d:0xfac8d05b29e51124!4m8!4m7!1m0!1m5!1m1!1s0x80d9530b1afdc975:0x43c1f338f12b2d7f!2m2!1d-117.1602967!2d32.7123966?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Prohibition Lounge': 'https://www.google.com/maps/dir//Prohibition+Lounge,+Fifth+Avenue,+San+Diego,+CA/@32.7111088,-117.2015526,13z/data=!3m2!4b1!5s0x80d95359c06594ff:0x3166420b734815bc!4m8!4m7!1m0!1m5!1m1!1s0x80d95359969f1e8d:0x80cb5720a7079ba3!2m2!1d-117.1603528!2d32.7111155?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Spin': 'https://www.google.com/maps/dir//Spin+Nightclub,+Hancock+Street,+San+Diego,+CA/@32.7445654,-117.2293474,13z/data=!3m1!5s0x80d95359c06594ff:0x3166420b734815bc!4m8!4m7!1m0!1m5!1m1!1s0x80deab242d3119e5:0xb8d04372de076287!2m2!1d-117.1881637!2d32.7445481?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Moonshine Flats': 'https://www.google.com/maps/dir//Moonshine+Flats,+Seventh+Avenue,+San+Diego,+CA/@32.7089493,-117.199623,13z/data=!3m1!5s0x80d95359c06594ff:0x3166420b734815bc!4m8!4m7!1m0!1m5!1m1!1s0x80d9535bcbbdbbf3:0x70f8f39ad9af97b1!2m2!1d-117.1584272!2d32.708955?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  '710 Beach Club': 'https://www.google.com/maps/dir//710+Beach+Club,+Garnet+Avenue,+San+Diego,+CA/@32.7965157,-117.2976933,13z/data=!3m1!5s0x80d95359c06594ff:0x3166420b734815bc!4m8!4m7!1m0!1m5!1m1!1s0x80dc01f2ae65c6af:0x99146f5ac448de12!2m2!1d-117.2564872!2d32.7965637?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Lahaina Beach House': 'https://www.google.com/maps/dir//Lahaina+Beach+House,+Oliver+Court,+San+Diego,+CA/@32.7917427,-117.2963409,13z/data=!3m2!4b1!5s0x80d95359c06594ff:0x3166420b734815bc!4m8!4m7!1m0!1m5!1m1!1s0x80dc01ee061546bd:0xbd48db964c21ad6c!2m2!1d-117.2550899!2d32.7917616?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'PB Avenue': 'https://www.google.com/maps/dir//PB+Avenue,+Garnet+Avenue,+San+Diego,+CA/@32.7979223,-117.2918438,13z/data=!3m2!4b1!5s0x80d95359c06594ff:0x3166420b734815bc!4m8!4m7!1m0!1m5!1m1!1s0x80dc01ecade3c4b9:0x8e6a606260c46304!2m2!1d-117.250644!2d32.797929?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Moonshine Beach': 'https://www.google.com/maps/dir//Moonshine+Beach,+Garnet+Avenue,+San+Diego,+CA/@32.7979634,-117.2896629,13z/data=!3m2!4b1!5s0x80d95359c06594ff:0x3166420b734815bc!4m8!4m7!1m0!1m5!1m1!1s0x80dc01eb38c46dc3:0x5808904c07a7b1f2!2m2!1d-117.2484565!2d32.797999?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Thrusters Lounge': 'https://www.google.com/maps/dir//Thrusters+Lounge,+Mission+Boulevard,+San+Diego,+CA/@32.7982273,-117.2969628,13z/data=!3m2!4b1!5s0x80d95359c06594ff:0x3166420b734815bc!4m8!4m7!1m0!1m5!1m1!1s0x80dc018d5f89c50b:0xf1f9875f9b06e172!2m2!1d-117.2558522!2d32.7982176?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'The Local': 'https://www.google.com/maps/dir//809+Thomas+Ave,+San+Diego,+CA+92109/@32.7936275,-117.3363491,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80dc01edbf3c2c65:0x2f493bf3ca6c6079!2m2!1d-117.2540394!2d32.7936796?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Open Bar': 'https://www.google.com/maps/dir//Open+Bar,+Mission+Boulevard,+San+Diego,+CA/@32.7937911,-117.2960545,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80dc01ed96ac9633:0x4b0c8d05f128d28c!2m2!1d-117.2548546!2d32.7937491?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Tavern at the Beach': 'https://www.google.com/maps/dir//Tavern+at+the+Beach,+Garnet+Avenue,+San+Diego,+CA/@32.7984768,-117.2892881,13z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x80dc01eb37514d83:0x358745da5581e5a5!2m2!1d-117.2480576!2d32.7983846?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Silver Fox Lounge': 'https://www.google.com/maps/dir//The+Silver+Fox+Lounge,+Garnet+Avenue,+San+Diego,+CA/@32.8005407,-117.2774869,13z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x80dc01c774748387:0xa39b4fb191cf801e!2m2!1d-117.2362871!2d32.8005474?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'The Collective': 'https://www.google.com/maps/dir//The+Collective,+Garnet+Avenue,+San+Diego,+CA/@32.7982636,-117.2879825,13z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x80dc01ce7fc3aa59:0xf2501c9f34e7985!2m2!1d-117.2468131!2d32.7983677?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Firehouse': 'https://www.google.com/maps/dir//Firehouse+American+Eatery+%26+Lounge,+Grand+Avenue,+San+Diego,+CA/@32.7947957,-117.2967235,13z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x80dc01ed7c120c7f:0xa18cdb473d169ff1!2m2!1d-117.2555753!2d32.7947897?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Nolita Hall': 'https://www.google.com/maps/dir//Nolita+Hall,+India+Street,+San+Diego,+CA/@32.728561,-117.2113885,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80d955913bee6bf9:0x8bf38d28551a3fd2!2m2!1d-117.1702488!2d32.7285764?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Camino Riviera': 'https://www.google.com/maps/dir//Camino+Riviera,+India+Street,+San+Diego,+CA/@32.7294067,-117.2121488,13z/data=!3m1!4b1!4m8!4m7!1m0!1m5!1m1!1s0x80d954b48b162d19:0xe99ec63692a39c2e!2m2!1d-117.1709429!2d32.7294262?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Waterfront': 'https://www.google.com/maps/dir//2044+Kettner+Blvd,+San+Diego,+CA+92101/@32.7256045,-117.2526514,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80d954b254babbb7:0x2ca8e2b66ea7a63b!2m2!1d-117.1702169!2d32.7256472?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Waterbar': 'https://www.google.com/maps/dir//Waterbar,+Ocean+Boulevard,+San+Diego,+CA/@32.7939291,-117.2968878,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80dc015375084dbd:0x634c6477aeb3b63c!2m2!1d-117.255688!2d32.7939358?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Beachcomber': 'https://www.google.com/maps/dir//Beachcomber,+Mission+Boulevard,+San+Diego,+CA/@32.7657266,-117.2922311,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80deaa11ec763f7d:0xf7912f6359f52908!2m2!1d-117.251111!2d32.7657344?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Sidecar': 'https://www.google.com/maps/dir//Sidecar+Bar,+Morena+Boulevard,+San+Diego,+CA/@32.771923,-117.2435618,13z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80deaa946d2899ff:0x96ee9d4bda91acc9!2m2!1d-117.202362!2d32.7719297?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Park & Rec': 'https://www.google.com/maps/dir//Park+%26+Rec,+Park+Boulevard,+San+Diego,+CA/@32.7613763,-117.1878217,13z/data=!3m1!5s0x80d9551e48530d97:0xb1935eacdbc64fe3!4m8!4m7!1m0!1m5!1m1!1s0x80d9551e499e69ad:0x56dc709d96ebf5e5!2m2!1d-117.1466219!2d32.761383?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'American Junkie': 'https://www.google.com/maps/dir//American+Junkie,+Fifth+Avenue,+San+Diego,+CA/@32.7121188,-117.2015705,13z/data=!3m1!5s0x80d9551e48530d97:0xb1935eacdbc64fe3!4m8!4m7!1m0!1m5!1m1!1s0x80d95359ca427f0b:0xb7463c3520c7b591!2m2!1d-117.1603707!2d32.7121255?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D',
  'Lafayette': 'https://www.google.com/maps/dir//2223+El+Cajon+Blvd,+San+Diego,+CA+92104/@32.7548874,-117.2230642,12z/data=!4m8!4m7!1m0!1m5!1m1!1s0x80d954e48e9c792f:0xf683f1f59b87baf5!2m2!1d-117.1406668!2d32.7549633?entry=ttu&g_ep=EgoyMDI1MDEyOS4xIKXMDSoASAFQAw%3D%3D'
};

const newsItems = [
  'Mavericks Beach Club: Come watch Super Bowl LIX on February 9th!',
  'Most Underrated: The Duck Dive (check it out!)',
  'Newest Venue Added: Hideaway',
  'Longest Top Rated Streak: Parq',
  'Hideaway: HAPPY HOUR from 3-6:30PM Monday thru Friday!',
  '710 Beach Club: Trivia Night EVERY Tuesday @ 7:00PM',
  'Firehouse: DJ GMRF performing June 4 @ 9:00PM',
  'The Collective: Jam Night EVERY Wednesday 7-11PM',
  'Silver Fox Lounge: Voted Best Happy Hour and Best Neighborhood Bar in SD!',
  'Lahaina Beach Houe: Best Sunsets since \'83',
  'Moonshine Beach: Ty Myers brings The Select Tour on Wednesday May 21!',
  'Mr Tempo: Banda EVERY Friday from 8PM-2AM',
  'Side Bar: LIMITED SPOTS for DJ Master Class February 2 thru February 6!',
  'Spin Nightclub: Damien Shane B2B Yoey performing January 30!'
];

const getRatingColorClass = (rating) => {
  if (rating >= 7) return 'text-green-500';
  if (rating < 5) return 'text-red-500';
  return 'text-gray-200';
};

const getFireOpacity = (rating) => {
  if (!rating) return 0;
  return Math.min(1, rating / 10);
};

const App = () => {
  const [ratings, setRatings] = useState({});
  const [ratedLocations, setRatedLocations] = useState(new Set());
  const [currentClubForComments, setCurrentClubForComments] = useState(null);
  const [commentsByClub, setCommentsByClub] = useState(
    clubsAndBars.reduce((acc, club) => {
      acc[club] = [];
      return acc;
    }, {})
  );
  const [newComment, setNewComment] = useState('');

  // Submission Popup
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [submissionEmail, setSubmissionEmail] = useState('');
  const [submissionMessage, setSubmissionMessage] = useState('');
  const [honeypotValue, setHoneypotValue] = useState("");
  const [previousNightTop, setPreviousNightTop] = useState(null);

  // For Search
  const [searchTerm, setSearchTerm] = useState('');

  // For Check-ins (Live Crowd Tracking)
  const [checkInCounts, setCheckInCounts] = useState({});
  const [checkedInLocations, setCheckedInLocations] = useState(new Set());

  // For Heat Map
  const [userLocations, setUserLocations] = useState([]);

  // ========== FIREBASE LOADING ==========

  // Load RATINGS from Firebase
  useEffect(() => {
    const ratingsRef = ref(database, 'ratings');
    onValue(ratingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRatings(data);
      }
    });
  }, []);
  
  // Listen to all user locations in Firebase
  useEffect(() => {
    const userLocRef = ref(database, 'userLocations');
    const unsubscribe = onValue(userLocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        // Convert the data object into an array of { lat, lng, timestamp } objects
        const locationsArray = Object.values(data);
        setUserLocations(locationsArray);
      } else {
        setUserLocations([]);
      }
    });
  
    return () => unsubscribe();
  }, []);

  // Load CHECK-INS from Firebase
  useEffect(() => {
    const checkInsRef = ref(database, 'checkIns');
    onValue(checkInsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setCheckInCounts(data);
    });
  }, []);

  // Top Rating from Previous Night
  useEffect(() => {
    const topRatingRef = ref(database, 'topRating');
    onValue(topRatingRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPreviousNightTop(data);
      } else {
        setPreviousNightTop(null);
      }
    });
  }, []);

  // Load comments ON DEMAND
  useEffect(() => {
    if (!currentClubForComments) return;
    const clubCommentsRef = ref(database, `comments/${currentClubForComments}`);
    const unsubscribe = onValue(clubCommentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const clubComments = Object.values(data).sort((a, b) => b.timestamp - a.timestamp);
        setCommentsByClub((prev) => ({
          ...prev,
          [currentClubForComments]: clubComments,
        }));
      } else {
        setCommentsByClub((prev) => ({
          ...prev,
          [currentClubForComments]: [],
        }));
      }
    });
    return () => unsubscribe();
  }, [currentClubForComments]);

  // ========== HELPER RENDERING ==========

  const renderAverage = (club) => {
    const clubRatings = ratings[club];
    if (!clubRatings || clubRatings.count === 0) {
      return <span className="text-gray-400">No ratings yet</span>;
    }
    const average = clubRatings.total / clubRatings.count;
    const colorClass = getRatingColorClass(average);
    return <span className={colorClass}>{average.toFixed(1)}</span>;
  };

  // ========== HANDLERS ==========

  // ADD COMMENT (PER CLUB)
  const handleAddComment = () => {
    if (!newComment.trim() || !currentClubForComments) return;
    const uniqueKey = Date.now();
    const clubCommentsRef = ref(database, `comments/${currentClubForComments}/${uniqueKey}`);
    const commentData = {
      text: newComment,
      timestamp: uniqueKey,
    };
    update(clubCommentsRef, commentData);
    setNewComment('');
  };

  // ADD RATING
  const handleRatingChange = (club, newRating) => {
    if (ratedLocations.has(club)) {
      alert('You have already rated this location.');
      return;
    }
    const clubRef = ref(database, `ratings/${club}`);
    const currentRating = ratings[club] || { total: 0, count: 0 };
    update(clubRef, {
      total: currentRating.total + newRating,
      count: currentRating.count + 1,
    });
    setRatedLocations((prev) => new Set(prev).add(club));
  };

  // SUBMISSION FOR NEW CLUB/BAR
  const handleSubmitClubSubmission = () => {
    if (honeypotValue.trim()) {
      alert("Spam detected! Honeypot field was filled.");
      return;
    }
    if (!submissionEmail.trim() || !submissionMessage.trim()) return;

    const uniqueKey = Date.now();
    const submissionRef = ref(database, `clubSubmissions/${uniqueKey}`);
    const submissionData = {
      email: submissionEmail,
      message: submissionMessage,
      timestamp: uniqueKey,
    };

    update(submissionRef, submissionData);
    setSubmissionEmail('');
    setSubmissionMessage('');
    setShowSubmissionForm(false);
    alert("Your message was submitted successfully! Thank you for improving Club Hoppr!");
  };

  // CHECK-IN / CROWD TRACKING
  const handleCheckIn = (club) => {
    if (checkedInLocations.has(club)) {
      alert('You have already checked in at this location.');
      return;
    }
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newRef = push(ref(database, 'userLocations'));
          set(newRef, {
            lat: latitude,
            lng: longitude,
            timestamp: Date.now(),
          });
          const currentCount = checkInCounts[club]?.count || 0;
          update(ref(database, `checkIns/${club}`), { count: currentCount + 1 })
            .then(() => {
              console.log(`Check-in successful for ${club}`);
              setCheckedInLocations((prev) => new Set(prev).add(club));
            })
            .catch((err) => console.error('Check-in failed:', err));
        },
        (error) => {
          console.error('Error getting geolocation:', error);
          alert('Unable to retrieve location. Check-in canceled. Check your settings to make sure your browser can access your location.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  // ========== SORTING & SEARCH FILTERING ==========

  const sortedClubs = [...clubsAndBars].sort((a, b) => {
    const clubARatings = ratings[a];
    const clubBRatings = ratings[b];
    const avgA =
      clubARatings && clubARatings.count > 0
        ? clubARatings.total / clubARatings.count
        : 0;
    const avgB =
      clubBRatings && clubBRatings.count > 0
        ? clubBRatings.total / clubBRatings.count
        : 0;
    return avgB - avgA;
  });

  const filteredClubs = sortedClubs.filter((club) =>
    club.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========== RENDER ==========

  return (
    <div className="min-h-screen w-screen flex flex-col items-center bg-black pt-0 p-4">
      {/* News Ticker at Top */}
      <NewsTicker items={newsItems} />

      <h1 className="text-5xl font-bold bg-gradient-to-b from-purple-500 to-violet-800 bg-clip-text text-transparent mb-6 text-center">
        CLUB HOPPR
      </h1>
      <h2 className="text-1xl font-bold text-neon-purple mb-6 text-center">
        Give YOUR Rating of the Hottest Spots in Downtown SD &amp; PB!
      </h2>

      {previousNightTop && (
        <div className="mb-6 p-4 bg-gray-900 rounded-lg shadow-lg text-center">
          <h2 className="text-md font-bold text-neon-purple mb-2 text-center">
            ⭐️ Top Rated from the Previous Night ⭐️
          </h2>
          <h3 className="text-white font-bold text-3xl mt-2 mb-1 text-center">
            {previousNightTop.club}
          </h3>
          <p className="text-yellow-400">
            Average Rating: {previousNightTop.average.toFixed(1)}
          </p>
        </div>
      )}

      {/* SEARCH BAR */}
      <div className="w-full max-w-md mb-6">
        <input
          type="text"
          className="w-full p-2 rounded bg-gray-800 text-white"
          placeholder="Search for a club..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LIST OF CLUBS */}
      <div className="w-screen max-w-2xl bg-gray-900 shadow-lg rounded-lg p-4 sm:p-6 md:p-8">
        {filteredClubs.map((club) => {
          const clubRatings = ratings[club];
          let averageNumeric = null;
          if (clubRatings && clubRatings.count > 0) {
            averageNumeric = clubRatings.total / clubRatings.count;
          }
          const fireOpacity = averageNumeric ? getFireOpacity(averageNumeric) : 0;
          // const crowdCount = checkInCounts[club] || 0;

          return (
            <div key={club} className="border-b border-neon-purple py-4">
              <button
                className="float-right px-4 py-2 text-sm sm:text-base sm:px-6 sm:py-3 bg-neon-purple text-black rounded hover:bg-purple-800 disabled:opacity-50"
                onClick={() => setCurrentClubForComments(club)}
              >
                View Comments
              </button>

              <h2 className="text-2xl font-semibold text-white mb-2">
                {/* Wrap the club name in an anchor tag */}
                <a
                  href={clubLocations[club] || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline"
                >
                  {club}
                </a>
                {averageNumeric && (
                  <span
                    style={{ marginLeft: '0.5rem', opacity: fireOpacity }}
                    aria-label="Fire Emoji"
                  >
                    🔥
                  </span>
                )}
              </h2>

              {/* AVERAGE RATING */}
              <p className="text-gray-400 mb-2">
                Average Rating: {renderAverage(club)}
              </p>

              {/* RATING BUTTONS */}
              <div className="flex flex-wrap space-x-1 mb-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => handleRatingChange(club, rating)}
                    className="px-2 py-0.5 bg-neon-purple text-black rounded hover:bg-purple-800 disabled:opacity-50"
                    disabled={ratedLocations.has(club)}
                  >
                    {rating}
                  </button>
                ))}
              </div>

              {/* CHECK-IN CROWD TRACKING */}
              <div className="flex items-center space-x-4 mb-2">
                <button
                  onClick={() => handleCheckIn(club)}
                  className="bg-blue-600 px-3 py-1 rounded hover:bg-blue-700 text-white"
                >
                  Check In
                </button>
                <p className="text-white">
                  Crowd Meter: <span className="text-yellow-400 font-bold">{checkInCounts[club]?.count || 0}</span> people
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <HeatMapContainer userLocations={userLocations} />

      {/* FOOTER */}
      <footer className="mt-6 text-gray-400 text-sm text-center">
        Ratings, Comments, &amp; Check-Ins reset daily at 6:00 AM PST
      </footer>

      {/* Request a Bar/Club to be Added */}
      <button
        className="mt-4 bg-neon-purple px-4 py-2 rounded hover:bg-purple-800 text-black"
        onClick={() => setShowSubmissionForm(true)}
      >
        Send Us Feedback
      </button>

      {/* COMMENTS SIDEBAR */}
      {currentClubForComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-end z-50">
          <div className="bg-gray-900 text-white w-80 h-full shadow-lg overflow-y-auto p-4 relative">
            <button
              className="float-right top-4 right-4 text-gray-400 hover:text-gray-200"
              onClick={() => setCurrentClubForComments(null)}
            >
              Close
            </button>
            <h2 className="text-2xl font-bold mb-4">{currentClubForComments}</h2>
            <div className="mt-4">
              <textarea
                className="w-full bg-gray-800 text-white rounded p-2"
                rows="3"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <button
                className="mt-2 bg-neon-purple px-4 py-2 rounded hover:bg-purple-800"
                onClick={handleAddComment}
              >
                Submit
              </button>
            </div>
            <div className="flex flex-col space-y-4 mt-4">
              {commentsByClub[currentClubForComments].map((comment, idx) => (
                <div key={idx} className="border-b border-gray-700 pb-2">
                  <p>{comment.text}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(comment.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Club Submission Popover */}
      {showSubmissionForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-gray-900 text-white w-80 rounded-lg shadow-lg p-4 relative">
            <button
              className="float-right mr-0.5 top-2 right-2 text-gray-400 hover:text-gray-200"
              onClick={() => setShowSubmissionForm(false)}
            >
              Close
            </button>
            <h2 className="text-2xl font-bold mb-4">Submit Feedback</h2>

            <label className="block mb-2 text-sm font-medium">Your Email:</label>
            <input
              type="email"
              value={submissionEmail}
              onChange={(e) => setSubmissionEmail(e.target.value)}
              className="w-full mb-4 p-2 rounded bg-gray-800 text-white"
              placeholder="email@example.com"
            />

            <label className="block mb-2 text-sm font-medium">
              Your Message:
            </label>
            <textarea
              value={submissionMessage}
              onChange={(e) => setSubmissionMessage(e.target.value)}
              rows={3}
              className="w-full mb-4 p-2 rounded bg-gray-800 text-white"
              placeholder="Tell us which venue you want added, concerns, questions, suggestions, etc..."
            />

            <input
              type="text"
              name="honeypot"
              value={honeypotValue}
              onChange={(e) => setHoneypotValue(e.target.value)}
              // Hide it from the UI so a normal user never sees it
              style={{ display: "none" }}
              autoComplete="off"
            />

            <button
              onClick={handleSubmitClubSubmission}
              className="bg-neon-purple px-4 py-2 rounded hover:bg-purple-800 text-black"
            >
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;