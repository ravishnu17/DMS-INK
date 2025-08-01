import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import userProfile from "/src/assets/user.png";
import {
  accessControlRoutes,
  communicationRoutes,
  configRoutes,
  documentRoutes,
  reportRoutes,
  routes,
} from "../routes";
import { ContextProvider } from "../App";
import profilepic from "../assets/user.png";
import UserProfile from "../pages/UserProfile";

function Sidebar({ menu, openSideBar }) {
  const { navState, setNavState, currUser, permissions } =
    useContext(ContextProvider);

  const navigate = useNavigate();

  const location = useLocation();
  const [openMenu, setOpenMenu] = useState([]);
  const [sideMenus, setSideMenus] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  useEffect(() => {
    const filteredAccessRoutes = accessControlRoutes?.filter((route) => {
      const rolePermissions = permissions?.role_permissions?.[route.key] ?? {};
      // Ensure at least one permission is true (add, view, edit, delete)
      return (
        rolePermissions.add ||
        rolePermissions.view ||
        rolePermissions.edit ||
        rolePermissions.delete
      );
    });

    const filterConfigRoutes = configRoutes?.filter((route) => {
      // console.log("route.key", route.key);
      const rolePermissions = permissions?.role_permissions?.[route.key] ?? {};
      // Ensure at least one permission is true (add, view, edit, delete)
      return (
        rolePermissions.add ||
        rolePermissions.view ||
        rolePermissions.edit ||
        rolePermissions.delete
      );
    });

    const filtercommunicationRoutes = communicationRoutes?.filter((route) => {
      const rolePermissions = permissions?.role_permissions?.[route.key] ?? {};
      // Ensure at least one permission is true (add, view, edit, delete)
      return (
        rolePermissions.add ||
        rolePermissions.view ||
        rolePermissions.edit ||
        rolePermissions.delete
      );
    });

    const filterDocumentHierarchyRoutes = documentRoutes?.filter((route) => {
      const rolePermissions = permissions?.role_permissions?.[route.key] ?? {};
      // Ensure at least one permission is true (add, view, edit, delete)
      return (
        rolePermissions.add ||
        rolePermissions.view ||
        rolePermissions.edit ||
        rolePermissions.delete
      );
    });

    const filterReportsRoutes = reportRoutes?.filter((route) => {
      const rolePermissions = permissions?.role_permissions?.[route.key] ?? {};
      // Ensure at least one permission is true (add, view, edit, delete)
      return (
        rolePermissions.add ||
        rolePermissions.view ||
        rolePermissions.edit ||
        rolePermissions.delete
      );
    });

    const sidemenu = [
      {
        name: "Dashboard",
        path: "/dashboard",
        icon: <i className="fa-solid fa-gauge fs-5" />,
        key: "dashboard",
      },
      {
        name: "Community",
        path: "/community",
        icon: <i className="fa-solid fa-people-group fs-5" />,
        key: "community",
      },
      {
        name: "Society",
        path: "/society",
        icon: <i className="fa-solid fa-people-roof fs-5" />,
        key: "society",
      },
      {
        name: "Parish",
        path: "/parish",
        icon: <i className="fa-solid fa-church fs-5" />,
        key: "parishes",
      },
      {
        name: "School",
        path: "/school",
        icon: <i className="fa-solid fa-school fs-5" />,
        key: "schools",
      },
      {
        name: "Technical Institute",
        path: "/technicalInstitute",
        icon: <i className="fa-solid fa-city fs-5" />,
        key: "technical institutions",
      },
      {
        name: "College",
        path: "/college",
        icon: <i className="fa-solid fa-graduation-cap fs-5" />,
        key: "colleges",
      },
      {
        name: "Boarding & Hostel",
        path: "/boardingHostel",
        icon: <i className="fa-solid fa-hotel fs-5" />,
        key: "boarding and hostel",
      },
      {
        name: "Department",
        path: "/department",
        icon: <i className="fa-solid fa-layer-group fs-5" />,
        key: "departments",
      },
      {
        name: "Social Sector",
        path: "/socialSector",
        icon: <i className="fa-solid fa-users-rays fs-5" />,
        key: "social sectors",
      },
      {
        name: "Company",
        path: "/company",
        icon: <i className="fa-solid fa-building fs-5" />,
        key: "companies",
      },

      {
        name: "Access Control",
        path: "/accessControl",
        icon: <i className="fa-solid fa-diagram-project fs-5" />,
        subMenu: filteredAccessRoutes?.length > 0 ? filteredAccessRoutes : [],
        key: "accessControl",
        condition: () => {
          return (
            permissions?.role_permissions &&
            (Object?.values(permissions?.role_permissions?.users ?? {}).some(
              (val) => val
            ) ||
              Object?.values(permissions?.role_permissions?.roles ?? {}).some(
                (val) => val
              ) ||
              Object?.values(
                permissions?.role_permissions?.confreres ?? {}
              ).some((val) => val) ||
              Object?.values(
                permissions?.role_permissions["access rights"] ?? {}
              ).some((val) => val))
          );
        },
      },
      {
        name: "Configurations",
        path: "/config",
        icon: <i className="fa-solid fa-sliders fs-5" />,
        subMenu: filterConfigRoutes?.length > 0 ? filterConfigRoutes : [],
        key: "config",
        condition: () => {
          return (
            permissions?.role_permissions &&
            (Object.values(
              permissions?.role_permissions["portfolio category"] ?? {}
            ).some((val) => val) ||
              Object.values(
                permissions?.role_permissions["web links"] ?? {}
              ).some((val) => val) ||
              Object.values(
                permissions?.role_permissions["category template"] ?? {}
              ).some((val) => val) ||
              Object.values(
                permissions?.role_permissions["mapping table"] ?? {}
              ).some((val) => val) ||
              Object.values(permissions?.role_permission?.dioceses ?? {}).some(
                (val) => val
              ))
          );
        },
      },

      {
        name: "Communication",
        path: "/communication",
        icon: <i className="fa-solid fa-envelope fs-5" />,
        subMenu:
          filtercommunicationRoutes?.length > 0
            ? filtercommunicationRoutes
            : [],
        key: "communication",
        condition: () => {
          return (
            permissions?.role_permissions &&
            (Object.values(permissions.role_permissions?.email ?? {}).some(
              (val) => val
            ) ||
              Object.values(permissions.role_permissions?.sms ?? {}).some(
                (val) => val
              ) ||
              Object.values(
                permissions.role_permissions?.notification ?? {}
              ).some((val) => val))
          );
        },
      },
      {
        name: "Document Hirarchy",
        path: "/documentHirarchy",
        icon: <i className="fa-solid fa-file fs-5" />,
        // subMenu: filterDocumentHierarchyRoutes?.length > 0 ? filterDocumentHierarchyRoutes : [],
        subMenu: documentRoutes,
        key: "documentHirarchy",
        condition: () => {
          return true;
        },
      },
      {
        name: "Reports",
        path: "/report",
        icon: <i className="fa-solid fa-file fs-5" />,
        // subMenu: filterReportsRoutes?.length > 0 ? filterReportsRoutes : [],
        subMenu: reportRoutes,
        key: "report",
        condition: () => {
          return true;
        },
      },
      // {
      //   name: 'Report',
      //   path: '/report',
      //   icon: <i className="fa-solid fa-chart-line fs-5" />,
      //   key: "report",
      //   condition: () => {
      //     return (
      //       permissions?.role_permissions &&
      //       Object.values(permissions?.role_permissions?.reports ?? {}).some(val => val)
      //     );
      //   }
      // }
    ];

    const filteredMenu = sidemenu.filter((item) => {
      // Ensure permissions exist before accessing properties

      const hasPermission = permissions?.[item.key] ?? false;

      // Ensure role_permissions exist before checking view permissions
      const hasRoleViewPermission =
        permissions?.role_permissions?.[item.key]?.view ?? false;

      // If there's a condition function (like in 'Configurations', 'Access Control', etc.), it should return true
      const meetsCondition = item?.condition ? item.condition() : true;

      if (item?.key === "accessControl") {
        // console.log(item?.key, " ", "hasRoleViewPermission",hasRoleViewPermission ,"meetsCondition",meetsCondition);
        return hasRoleViewPermission || meetsCondition;
      } else if (item?.key === "config") {
        // console.log(item?.key," ", "hasRoleViewPermission",hasRoleViewPermission ,"meetsCondition",meetsCondition);
        return hasRoleViewPermission || meetsCondition;
      } else if (item?.key === "communication") {
        // console.log(item?.key," ", "hasRoleViewPermission",hasRoleViewPermission ,"meetsCondition",meetsCondition);
        return hasRoleViewPermission || meetsCondition;
      } else if (item?.key === "documentHirarchy") {
        // console.log(item?.key," ", "hasRoleViewPermission",hasRoleViewPermission ,"meetsCondition",meetsCondition);
        return hasRoleViewPermission || meetsCondition;
      } else if (item?.key === "report") {
        // console.log(item?.key," ", "hasRoleViewPermission",hasRoleViewPermission ,"meetsCondition",meetsCondition);
        return hasRoleViewPermission || meetsCondition;
      } else if (item?.key === "dashboard") {
        return hasPermission;
      } else {
        // console.log(item.key ,"",hasRoleViewPermission , hasPermission);
        return hasPermission && hasRoleViewPermission;
      }
    });
    setSideMenus(filteredMenu);
  }, [currUser, permissions]);

  const user = {
    name: "John Doe",
    role: "Admin",
    designation: "Software Developer",
    email: "a8Tb0@example.com",
    phoneNo: "1234567890",
    whatsappNo: "9876543210",
    dob: "1990-01-01",
    profileImage: profilepic,
  };

  return (
    <>
      <aside className={`sidebar ${menu ? "open" : ""} pt-2 `} id="sidebar">
        <div className="d-flex justify-content-end">
          <button className="btn " onClick={openSideBar}>
            {/* <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
          </svg> */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              fill="currentColor"
              className="bi bi-x-lg"
              viewBox="0 0 16 16"
            >
              <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
            </svg>
          </button>
        </div>
        <div>
          <div className="d-flex justify-content-center  position-relative">
            <img
              src={currUser?.profile_pic ? currUser.profile_pic : userProfile}
              className="rounded-circle"
              width={90}
              height={90}
              alt="User"
              style={{ objectFit: "cover" }}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = userProfile;
              }}
            />
            {/* <span className="position-absolute adminEdit-icon" title='Edit Profile' data-bs-toggle="modal" data-bs-target="#profileModal" onClick={() => setShowProfile(pre => !pre)}> */}
            <span
              className="position-absolute adminEdit-icon"
              title="Go to Profile"
              onClick={() => navigate("/userProfile")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width={18}
                fill="white"
                className="bi bi-person-gear"
                viewBox="0 0 16 16"
              >
                <path d="M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4m.256 7a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1zm3.63-4.54c.18-.613 1.048-.613 1.229 0l.043.148a.64.64 0 0 0 .921.382l.136-.074c.561-.306 1.175.308.87.869l-.075.136a.64.64 0 0 0 .382.92l.149.045c.612.18.612 1.048 0 1.229l-.15.043a.64.64 0 0 0-.38.921l.074.136c.305.561-.309 1.175-.87.87l-.136-.075a.64.64 0 0 0-.92.382l-.045.149c-.18.612-1.048.612-1.229 0l-.043-.15a.64.64 0 0 0-.921-.38l-.136.074c-.561.305-1.175-.309-.87-.87l.075-.136a.64.64 0 0 0-.382-.92l-.148-.045c-.613-.18-.613-1.048 0-1.229l.148-.043a.64.64 0 0 0 .382-.921l-.074-.136c-.306-.561.308-1.175.869-.87l.136.075a.64.64 0 0 0 .92-.382zM14 12.5a1.5 1.5 0 1 0-3 0 1.5 1.5 0 0 0 3 0" />
              </svg>
            </span>
          </div>

          <div className="text-center mt-2 p-2">
            <p
              className="ms-2 fw-bold m-0"
              style={{ overflowWrap: "anywhere", fontSize: "larger" }}
            >
              {currUser?.name}
            </p>
            <p
              className="ms-2 text-muted fw-bold m-0"
              style={{ overflowWrap: "anywhere", fontSize: "small" }}
            >
              {currUser?.role?.name}
            </p>
          </div>
        </div>
        <nav className="sidebar-menu-content mt-2 p-2">
          <ul className="nav flex-column">
            {sideMenus?.map((item, index) => (
              <li
                key={index}
                className={`nav-item nav-item-main my-1 ${
                  [
                    location.pathname.split("/")[1]?.toLowerCase(),
                    navState?.module_name?.toLowerCase(),
                  ].includes(item.path.split("/")[1]?.toLowerCase())
                    ? "active"
                    : ""
                }`}
              >
                {item.subMenu ? (
                  <div className="dropdown">
                    <button
                      className="nav-link w-100 d-flex justify-content-between align-items-center text-start dropdown-toggle-item"
                      data-bs-toggle="collapse"
                      data-bs-target={`#submenu-${index}`}
                      onClick={() =>
                        setOpenMenu(
                          openMenu.includes(index)
                            ? openMenu.filter((i) => i !== index)
                            : [...openMenu, index]
                        )
                      }
                    >
                      <span className="me-2">
                        <span className="me-3">{item.icon}</span>
                        {item.name}
                      </span>
                      {openMenu.includes(index) ? (
                        <i className="fa-solid fa-caret-up" />
                      ) : (
                        <i className="fa-solid fa-caret-down" />
                      )}
                    </button>
                    {item?.subMenu && (
                      <div
                        className={`${
                          location.pathname.split("/")[1] ===
                          item.path.split("/")[1]
                            ? "submenu-active"
                            : ""
                        }`}
                      >
                        <ul
                          className="collapse list-unstyled p-2"
                          id={`submenu-${index}`}
                        >
                          {item.subMenu.map((sub, subIndex) => (
                            <li
                              key={subIndex}
                              className={`nav-item nav-item-sub my-1 ${
                                location.pathname.split("/")[2] ===
                                sub.path.split("/")[1]
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <Link
                                onClick={() =>
                                  setNavState({
                                    module_name: item.path.split("/")[1],
                                  })
                                }
                                to={`${item.path}${sub.path}`}
                                className="nav-link"
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    to={item.path}
                    onClick={() =>
                      setNavState({ module_name: item.path.split("/")[1] })
                    }
                    className={`nav-link px-3 py-2 11 ${
                      [
                        location.pathname.split("/")[1]?.toLowerCase(),
                        navState?.module_name?.toLowerCase(),
                      ].includes(item.path.split("/")[1]?.toLowerCase())
                        ? "active nav-main-only"
                        : ""
                    }`}
                  >
                    <span className="me-3">{item.icon}</span>
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* profile modal */}
      <div
        className="modal fade "
        id="profileModal"
        backdrop="static"
        keyboard="false"
        tabIndex="-1"
        aria-labelledby="addModelLabel"
      >
        <div className="modal-dialog modal-lg" role="document">
          <div className="modal-content rounded-1">
            <div className="modal-header">
              <h6 className="modal-title fw-bold">User Profile</h6>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
              ></button>
            </div>
            <div className="modal-body">
              <UserProfile user={user} isOpen={showProfile} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
