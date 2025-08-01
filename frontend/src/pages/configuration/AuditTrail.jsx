import React from 'react'

function AuditTrail({ history }) {
  const pad = (n) => n.toString().padStart(2, '0');

  const formatISTDate = (isoDate) => {
    const date = new Date(isoDate);
    const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const day = pad(istDate.getDate());
    const month = pad(istDate.getMonth() + 1);
    const year = istDate.getFullYear();
    let hours = istDate.getHours();
    const minutes = pad(istDate.getMinutes());
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
  };
  // const formatISTDate = (isoDate) => {
  //   const date = new Date(isoDate);
  //   const istDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  //   const day = pad(istDate.getDate());
  //   const month = pad(istDate.getMonth() + 1);
  //   const year = istDate.getFullYear();
  //   let hours = istDate.getHours();
  //   const minutes = pad(istDate.getMinutes());
  //   const seconds = pad(istDate.getSeconds());
  //   const ampm = hours >= 12 ? 'PM' : 'AM';
  //   hours = hours % 12 || 12;
  //   return `${day}/${month}/${year} ${pad(hours)}:${minutes}:${seconds} ${ampm}`;
  // };
  const ArrowIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-arrow-right" viewBox="0 0 16 16">
      <path fillRule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8" />
    </svg>
  );

  const capitalizeName = (name) => {
    if (!name) return '';
    return name
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  

  return (
    <div className="d-flex flex-column gap-3 p-3">
      {history.map((item, index) => {
        const isCreated = item.modification_type === "Create";
        const changes = [];

        // if (!isCreated && item.old_value && item.new_value) {
        //   for (let key in item.new_value) {
        //     if (item.old_value[key] && item.old_value[key] !== item.new_value[key]) {
        //       changes.push({ field: key, from: item.old_value[key], to: item.new_value[key] });
        //     }
        //   }
        // }
        if (!isCreated && item.old_value && item.new_value) {
          for (let key in item.new_value) {
            if (!key.endsWith('_id')) {
              // Always push password if it exists in new_value
              if (key === 'password') {
                changes.push({
                  field: key,
                  from:item.old_value[key],
                  to: item.new_value[key]
                });
              } else if (
                item.old_value[key] !== undefined &&
                item.old_value[key] !== item.new_value[key]
              ) {
                changes.push({
                  field: key,
                  from: item.old_value[key],
                  to: item.new_value[key]
                });
              }
            }
          }
        }


     


        return (
          <div key={index} className="border rounded shadow-sm p-3 bg-light">
            {isCreated ? (
              <>
                <strong className='audit-strong'>Created by {item.user_name} - {formatISTDate(item.datetime)}</strong><br />
                <strong className='audit-lazy'>Record:</strong> {item.record_title}
              </>
            ) : (
              <>
                <strong className='audit-strong'  >Changed by {item.user_name} on {formatISTDate(item.datetime)}</strong><br />
                {/* {changes.map((change, idx) => (
                  <div key={idx}>
                    <strong className='audit-lazy'>{capitalizeName(change?.field)}:</strong> {change?.from} <ArrowIcon /> {change?.to}
                  </div>
                ))} */}
                {changes.map((change, idx) => (
                  <div key={idx}>
                    <strong className='audit-lazy'>{capitalizeName(change?.field)}:</strong>{" "}
                    {change?.from ? (
                      <>
                        {change.from} <ArrowIcon /> {change.to}
                      </>
                    ) : (
                      change.to
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        );
      })}
    </div>
  );

}

export default AuditTrail