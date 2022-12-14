import React, { useState, useEffect } from 'react';
import mockUser from './mockData.js/mockUser';
import mockRepos from './mockData.js/mockRepos';
import mockFollowers from './mockData.js/mockFollowers';
import axios from 'axios';

const rootUrl = 'https://api.github.com';
const GithubContext=React.createContext();
const GithubProvider=({children})=>{
    const [githubUser,setGithubUser]=useState(mockUser)
    const[repos,setRepos]=useState(mockRepos)
    const[followers,setFollowers]=useState(mockFollowers)
    const[requests,setRequests]=useState(0)
    const[loading,setLoading]=useState(false)
    const[error,setError]=useState({show:false,msg:''})
    const searchUser=async(user)=>{
        toggleError()
        setLoading(true)
        const resp=await axios(`${rootUrl}/users/${user}`).catch(err=>console.log(err))
// console.log(user)
if(resp){
    setGithubUser(resp.data)
    const{login,followers_url}=resp.data
    await Promise.allSettled([axios(`${rootUrl}/users/${login}/repos?per_page=100`),axios(`${followers_url}/repos?per_page=100`)]).then(results=>{
        const [repos,follwers]=results
        const status='fulfilled'
        if(repos.status=status){
            setRepos(repos.value.data)
        }
        if(followers.status===status){
            setFollowers(followers.value.data)
        }
    })
    // https://api.github.com/users/john-smilga/repos?per_page=100
    // https://api.github.com/users/john-smilga/followers
}
else{
    toggleError(true,'theres no user with matching username')
}
checkRequest()
setLoading(false)
    }
    const checkRequest=async()=>{
        axios(`${rootUrl}/rate_limit`).then(({data})=>{
            let {rate:{remaining}}=data
            setRequests(remaining)
            if(remaining===0){
                toggleError(true,'sorry, reuests exceeded limit')
            }
        }).catch((error)=>{

            console.log(error)
        })
    }
    const toggleError=(show=false,msg='')=>{
        setError({show,msg})
    }
    useEffect( checkRequest,[])
    console.log(githubUser)
    return <GithubContext.Provider value={{repos,githubUser,followers,requests,error,searchUser,loading,setLoading}}>
        {children}
    </GithubContext.Provider>
}

// export{GitHubProvider,GithubContext}
export {GithubProvider,GithubContext}