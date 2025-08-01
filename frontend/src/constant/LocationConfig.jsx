import React, { useEffect, useState } from 'react'
import { getAPI } from './apiServices';
import Select from 'react-select';
import { Controller } from 'react-hook-form';

function LocationConfig({ control, errors, setValue, watch }) {

    const [countryList, setCountryList] = useState([]);
    const [stateList, setStateList] = useState([]);
    const [districtList, setDistrictList] = useState([]);
    const [regionList, setRegionList] = useState([]);

    const country_id = watch('country_id');
    const state_id = watch('state_id');
    const region_id = watch('region_id');
    const district_id = watch('district_id');
    
  useEffect(() => {
        getCountryList();
        getRegionList();
    }, []);

    const getCountryList = () => {
        getAPI('location/country?skip=0&limit=0').then((res) => {
            // console.log("country res", res?.data?.data[5]);
            
            if (res?.data?.status) {
                setCountryList(res?.data?.data);
                if (res?.data?.data?.length === 1) {
                    setTimeout(() => {
                        setValue("country_id", { value: String(res?.data?.data[5]?.id), label: res?.data?.data[5]?.name }, { shouldValidate: true });
                    }, 100);
                }
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    const getStatseList = (country_id) => {
       
        if (!country_id || country_id === "undefined" || country_id === "null") { // Handles undefined, null, or incorrect values
            // console.warn("Invalid country_id:", country_id);
            return; // Stop execution
        }
    
        getAPI(`/location/state?skip=0&limit=0&country_id=${country_id}`)
            .then((res) => {
                if (res?.data?.status) {
                    setStateList(res?.data?.data);
                    
                    if (res?.data?.data?.length === 1) {
                        setTimeout(() => {
                            setValue("state_id", {
                                value: String(res?.data?.data[0]?.id),
                                label: res?.data?.data[0]?.name
                            }, { shouldValidate: true });
                        }, 100);
                    }
    
                    if (!(res?.data?.data?.some((item) => item.id === state_id?.value))) {
                        setValue("state_id", null);
                    }
                }
            })
            .catch((err) => {
                console.error("API Error:", err);
            });
    };
    
    const getRegionList = () => {
        // console.log("region Api call");
        
        getAPI('/location/region?skip=0&limit=0').then((res) => {
            if (res?.data.status) {
                // console.log("region res region  ", res?.data?.data);
                setRegionList(res?.data?.data);
                if (res?.data?.data?.length === 1) {
                    setTimeout(() => {
                        setValue("region_id", { value: String(res?.data?.data[0]?.id), label: res?.data?.data[0]?.name }, { shouldValidate: true });
                    }, 100);
                }
                if (!(res?.data?.data?.some((item) => item.id === region_id?.value))) {
                    setValue("region_id", null);
                }
            }
        }).catch((err) => {
            console.log(err);
        })
    }
    const getdistrictList = (state_id) => {
        getAPI('/location/district?skip=0&limit=0&state_id=' + state_id).then((res) => {
            if (res?.data?.status) {
                setDistrictList(res?.data?.data);
                if (res?.data?.data?.length === 1) {
                    setTimeout(() => {
                        setValue("district_id", { value: String(res?.data?.data[0]?.id), label: res?.data?.data[0]?.name }, { shouldValidate: true });
                    }, 100)
                }
                if (!(res?.data?.data?.some((item) => item.id === district_id?.value))) {
                    setValue("district_id", null);
                }
            }
        }).catch((err) => {
            console.log(err);
        })
    }

  

    useEffect(() => {
        // set country if only one country
        if (countryList.length === 1 && !country_id?.value)
            setValue("country_id", { value: String(countryList[0]?.id), label: countryList[0]?.name }, { shouldValidate: true });
        if (country_id?.value) {
            getStatseList(country_id?.value);
        } else {
            setStateList([]);
            // setRegionList([]);
            setDistrictList([]);
            setValue('state_id', null);
            setValue('region_id', null);
            setValue('district_id', null);
        }
    }, [country_id?.value])

    useEffect(() => {
        if (state_id?.value) {
            getdistrictList(state_id.value);
        } else {
            setDistrictList([]);
            setValue('district_id', null);
        }
      
    }, [state_id?.value])

    // useEffect(() => {
    //     if (region_id?.value) {
    //         getdistrictList(region_id?.value);
    //     } else {
    //         setDistrictList([]);
    //         setValue('district_id', null);
    //     }
    // }, [region_id?.value])

    // console.log("regionlist", regionList);
    

    return (
        <>
            <div className='col-md-3 mb-1'>
                <label className='form-label'>Country <span className='text-danger'>*</span></label>
                {/* <input type='text' className='form-control' placeholder='Enter district' {...register('district', { required: 'District is required' })} /> */}
                <Controller
                    name="country_id"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={countryList?.map((data) => ({ value: String(data.id), label: data.name }))}
                            className="custom-react-select"
                            placeholder="Select Country"
                            isClearable
                        />
                    )}
                />
                <p className='text-danger'>{errors.country_id?.message}</p>
            </div>
            <div className='col-md-3 mb-1'>
                <label className='form-label'>State <span className='text-danger'>*</span></label>
                <Controller
                    name="state_id"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={stateList?.map((data) => ({ value: String(data.id), label: data.name }))}
                            className="custom-react-select"
                            placeholder="Select State"
                            isClearable
                        />
                    )}
                />
                <p className='text-danger'>{errors.state_id?.message}</p>
            </div>
          
            <div className='col-md-3 mb-1'>
                <label className='form-label'>Region <span className='text-danger'>*</span></label>
                <Controller
                    name="region_id"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={regionList?.map((data) => ({ value: String(data.id), label: data.name }))}
                            className="custom-react-select"
                            placeholder="Select Region"
                            isClearable
                        />
                    )}
                />
                <p className='text-danger'>{errors.region_id?.message}</p>
            </div>
            <div className='col-md-3 mb-1'>
                <label className='form-label'>District <span className='text-danger'>*</span></label>
                <Controller
                    name="district_id"
                    control={control}
                    render={({ field }) => (
                        <Select
                            {...field}
                            options={districtList?.map((data) => ({ value: String(data.id), label: data.name }))}
                            className="custom-react-select"
                            placeholder="Select District"
                            isClearable
                        />
                    )}
                />
                <p className='text-danger'>{errors.district_id?.message}</p>
            </div>
        </>
    )
}

export default LocationConfig