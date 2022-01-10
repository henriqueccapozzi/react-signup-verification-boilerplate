import React, { useEffect, useState } from "react";

const UserList = () => {
  const [userList, setUserList] = useState([]);

  useEffect(() => {
    console.log("Initial loading");
    const requestOptions = { credentials: "include" };
    fetch(`http://localhost:8000/api/users/?page=1  `, requestOptions)
      .then((response) => response.text())
      .then((data) => {
        const results = JSON.parse(data).results;
        console.log(results);
        setUserList(results);
      });
  }, []);

  return (
    <div>
      <p>User list component</p>
      <ul>
        {userList.map((userObj) => {
          return <li key={userObj.url}>{JSON.stringify(userObj)}</li>;
        })}
      </ul>
    </div>
  );
};

export default UserList;
