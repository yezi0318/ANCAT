import React, { useState, useEffect, useRef } from 'react';
import {
  Layout,
  theme,
  Col,
  Row,
  Button,
  Tag,
  Dropdown,
  Card,
  Space,
  Tooltip,
  Popconfirm,
  Empty,
  Input,
  Modal,
  message,
  Spin,
  Tabs,
  Form,
  Collapse,
} from 'antd';

import {
  LeftCircleTwoTone,
  RightCircleTwoTone,
  DownOutlined,
  EditTwoTone,
  CloseCircleTwoTone,
  FileAddOutlined,
} from '@ant-design/icons';
import './upload-world.css';
const { Header } = Layout;
import Highlighter from 'web-highlighter';
import { signOut } from 'firebase/auth';
import {
  doc,
  addDoc,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import CheckableTag from 'antd/es/tag/CheckableTag';

const { TextArea } = Input;
const items = [
  {
    key: '1',

    label: <Tag color="#f50">Confusing</Tag>,
  },

  {
    key: '2',
    label: <Tag color="#2db7f5">Embrrassing</Tag>,
  },
  {
    key: '3',
    label: <Tag color="#87d068">Important</Tag>,
  },
  {
    key: '4',
    label: <div>Delete</div>,
  },
];

export default function UploadWorld() {
  const containerRef = useRef(null);
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [data, setData] = useState([]);

  const [selected, setSelected] = useState(0);
  const [text, setText] = useState('');
  const [tabs, setTabs] = useState([]);

  const highlighterRef = useRef(true);
  const highlighterRef1 = useRef(new Highlighter());
  const selectedRef = useRef(selected); 
  const tagMenuArr = useRef([]);
  const dataRef = useRef([]);
  const highRef = useRef([]);
  const [tagMenu, setTagMenu] = useState(tagMenuArr.current);
  const [allHighLighter, setAllHighLighter] = useState([]);
  const [currentEditNote, setCurrentEditNote] = useState();
  const [note, setNote] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  useEffect(() => {
    auth.onAuthStateChanged(function (user) {
      if (user) {
        localStorage.setItem('userUID', user.uid);
      } else {
        localStorage.removeItem('userUID');
      }
    });
  }, []);
  const getUserData = () => {
    setLoading(true);

    const articleCollectionRef = collection(db, 'article');
    const q = query(
      articleCollectionRef,
      where(
        'uid',
        '==',
        auth?.currentUser?.uid || localStorage.getItem('userUID')
      )
    );

    onSnapshot(q, (querySnapshot) => {
      const arr = [];
      const tabs = [];
      querySnapshot.forEach((doc) => {
        const obj = { ...doc.data() };
        obj.tagArr = JSON.parse(obj.tagArr) || [];
        arr.push({ ...obj, id: doc.id });
      });
      arr.forEach((item, index) => {
        tabs.push({ key: index, label: `Note ${index + 1}` });
      });

      setTabs(tabs);
      setData(arr);
      if (arr && arr.length > 0) {
        getCurrentHighLighter(arr[0]?.id);
        getCurrentNote(arr[0]?.id);
      }

      setLoading(false);
    });
  };
  const getCurrentNote = (id) => {
    setLoading(true);

    const articleCollectionRef = collection(db, 'note');
    const q = query(articleCollectionRef, where('articleId', '==', id));
    onSnapshot(q, (querySnapshot) => {
      const noteArr = [];
      querySnapshot.forEach((doc) => {
        const obj = { ...doc.data(), id: doc.id };

        noteArr.push(obj);
      });
      console.log(noteArr, 'Note');
      setNote(noteArr);
      setLoading(false);
    });
  };
  const getCurrentHighLighter = (id) => {
    setLoading(true);

    const articleCollectionRef = collection(db, 'highLighterSource');
    const q = query(articleCollectionRef, where('articleId', '==', id));

    onSnapshot(q, (querySnapshot) => {
      const tagArr = [];
      const highArr = [];
      querySnapshot.forEach((doc) => {
        const obj = { ...doc.data(), id: doc.id };
        obj.metaData = JSON.parse(obj.metaData);
        obj.metaData[0].hs.articleId = obj.articleId;
        obj.position.dataId = obj.id;
        obj.position.text = obj.metaData[0].hs.text;
        obj.position.hide = true;
        tagArr.push(obj.position);
        highArr.push(obj);
      });

      if (tagArr.length == 0 || highArr.length == 0) {
        highlighterRef1.current.removeAll();
      }

      setTagMenu(tagArr);
      tagMenuArr.current = tagArr;
      setAllHighLighter(highArr);
      handleHigh();
      setLoading(false);
    });
  };
  const highlighter = new Highlighter();
  const getPosition = ($node) => {
    let offset = {
      top: 0,
      left: 0,
    };
    while ($node) {
      offset.top += $node.offsetTop;
      offset.left += $node.offsetLeft;
      $node = $node.offsetParent;
    }

    return offset;
  };

  useEffect(() => {
    highlighterRef1.current.setOption({
      $root: document.getElementById('article-select'),
    });

    selectedRef.current = selected;
    dataRef.current = data;
    highRef.current = allHighLighter;
    tagMenuArr.current = tagMenu;

    if (highlighterRef.current) {
      getUserData();
      highlighterRef1.current
        .on(Highlighter.event.HOVER, ({ id }) => {
          tagMenuArr.current = tagMenuArr.current.map((item) => {
           

            return { ...item, hide: true };
          });
          tagMenuArr.current = tagMenuArr.current.map((item) => {
            if (item.id === id) {
              return { ...item, hide: false };
            }
            return item;
          });

          setTagMenu(tagMenuArr.current);
        })
        .on(Highlighter.event.CREATE, ({ sources }) => {
          const tagArr = [];
          let tag = {};
          sources.forEach((s) => {
            const position = getPosition(highlighter.getDoms(s.id)[0]);
            const newTag = {
              top: position.top,
              left: position.left,
              id: s.id,
              text: s.text,
            };
            tag = newTag;
            tagArr.push(newTag);
          });

          sources = sources.map((hs) => ({ hs }));
          const currentSelected = selectedRef.current;

          if (dataRef.current[currentSelected].id !== sources[0].hs.extra) {
            highlighterRef1.current.removeAll();
          }
          let flag = true;
          highRef.current.forEach((item) => {
            item.metaData.forEach((val) => {
              if (sources[0].hs.id == val.hs.id) flag = false;
            });
          });

          if (flag) {
            if (
              dataRef.current[currentSelected].id == sources[0].hs.extra ||
              !sources[0].hs?.extra
            ) {
              addDoc(collection(db, 'highLighterSource'), {
                articleId: dataRef.current[currentSelected].id,
                position: tag,
                metaData: JSON.stringify(sources),
                metaId: sources[0].hs.id,
              }).then(() => {
                console.log('You have successfully created');
              });
            }
          } else {
            console.log('The one already exists, no need to redo it');
          }
        })
        .on(Highlighter.event.HOVER_OUT, ({ id }) => {
          highlighter.removeClass('highlight-wrap-hover', id);
        })
        .on(Highlighter.event.REMOVE, ({ ids }) => {
          console.log('delete');
          // log("remove -", ids);
          // ids.forEach((id) => store.remove(id));
        })

        .on(Highlighter.event.CLICK, ({ id }) => {
          var target = document.getElementById(id);

          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' }); 
          }
        });


      highlighterRef1.current.run();

      highlighterRef.current = null;
    }


    return () => {
      highlighterRef1.current.off(Highlighter.event.CREATE);
      highlighterRef1.current.off(Highlighter.event.CLICK);
      highlighterRef1.current.off(Highlighter.event.HOVER);
      highlighterRef1.current.off(Highlighter.event.HOVER_OUT);
      highlighterRef1.current.off(Highlighter.event.REMOVE);
      
    };

  }, [tagMenu, selected]);

  const updateArticle = (item) => {
    setLoading(true);
    updateDoc(doc(db, 'article', item?.id), {
      tagArr: JSON.stringify(item.tagArr),
    }).then(() => {
      setLoading(false);
    });
  };
  useEffect(() => {
    handleHigh();

  }, [selected, allHighLighter]);

  const handleHigh = () => {
    allHighLighter.forEach((item) => {
      const { metaData } = item;

      metaData?.forEach((item) => {
        highlighterRef1.current.fromStore(
          item.hs.startMeta,
          item.hs.endMeta,
          item.hs.text,
          item.hs.id,
          item.hs.articleId
        );
      });
    });
  };
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const editText = (item) => {
    setIsEdit(true);
    setIsModalOpen1(true);
    form1.setFieldsValue({ note: item.note });
    setCurrentEditNote(item);
    console.log(item.note, 'item');
  };

  const confirm = (item) => {
    console.log(item, 'Delete');
    deleteDoc(doc(db, 'note', item.id)).then(() => {
      message.success('Success');
      getCurrentNote(item.articleId);
    });
  };

  const loginOut = () => {
    signOut(auth).then((res) => {
      navigate('/');
    });
  };
  const showModal = () => {
    form.resetFields();
    setIsModalOpen(true);
  };
  const showModal1 = () => {
    if (!isEdit) {
      console.log('Is it empty?');
      form1.resetFields();
    }
    setIsModalOpen1(true);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleCancel1 = () => {
    setIsModalOpen1(false);
  };
  const deleteNote = async () => {
    deleteDoc(doc(db, 'article', data[selected].id)).then(() => {
      message.success('Sucess');
      getUserData();
    });

    const collectionRef = collection(db, 'highLighterSource');
    const querySnapshot = await getDocs(
      query(collectionRef, where('articleId', '==', data[selected].id))
    );
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log('All documents deleted.');
  };
  const onTabChange = (key) => {
    setSelected(key);
    setAllHighLighter([]);
    highRef.current = [];
    highlighterRef1.current.removeAll();
    clearTag();
    if (data[selected]?.id) {
      getCurrentHighLighter(data[key]?.id);
      getCurrentNote(data[key]?.id);
    }
  };
  const onFinish = async (values) => {
    const userUid = auth.currentUser.uid;
    setLoading(true);
    setIsModalOpen(false);
    await addDoc(collection(db, 'article'), {
      uid: userUid,
      article: values.article,
      tagArr: JSON.stringify([]),
      title: values.title,
    });
    setLoading(false);
    message.success('Add Success');
    getUserData();
  };
  const onFinish1 = async (values) => {
    if (isEdit) {
      setLoading(true);
      console.log('Edit', currentEditNote);
      updateDoc(doc(db, 'note', currentEditNote.id), {
        note: values.note,
      }).then(() => {
        setLoading(false);
      });
      handleCancel1();
      message.success('Success');
      getCurrentNote(data[selected].id);
    } else {
      console.log(values, 'New', currentEditNote);
      setLoading(true);
      setIsModalOpen(false);
      await addDoc(collection(db, 'note'), {
        note: values.note,
        highlighterId: currentEditNote.id,
        highlighterDataId: currentEditNote.dataId,
        articleId: data[selected].id,
        text: currentEditNote.text,
      });
      setLoading(false);
      handleCancel1();
      getCurrentNote(data[selected].id);
      message.success('Success');
    }
  };

  const handleTagMouseLeave = (id) => {
    
    const newTagMenu = tagMenu.map((item) => {
      if (item.id === id) {
        return { ...item, hide: true };
      }
      return item;
    });


    setTagMenu(newTagMenu);
  };
  const clearTag = () => {

    const newTagMenu = tagMenu.map((item) => ({ ...item, hide: true }));

    setTagMenu(newTagMenu);
  };
  const handleTagClick = (tag) => {
    deleteDoc(doc(db, 'highLighterSource', tag.dataId)).then(() => {
      setTagMenu(tagMenu.filter((item) => item.id !== tag.id));
      tagMenuArr.current = tagMenuArr.current.filter(
        (item) => item.id !== tag.id
      );
      highlighter.remove(tag.id);
    });
  };
  const addNote = (item) => {
    setCurrentEditNote(item);
    setIsEdit(false);
    console.log('Highlight the data', item, data[selected]);
    showModal1();
  };

  const renderTags = () => {
    return tagMenu.map((tag, index) => (
      <div
        key={index}
        id={tag.id}
        className={tag.hide ? 'tag-hover-content' : 'my-remove-tip'}
        style={{
          top: `${tag.top - 25}px`,
          left: `${tag.left - 20}px`,
        }}
        onMouseLeave={() => handleTagMouseLeave(tag.id)}
      >
        <div style={{ display: 'flex' }}>
          <div
            style={{ background: '#444', padding: '1px' }}
            onClick={() => handleTagClick(tag)}
          >
            Delete
          </div>
          <div
            onClick={() => addNote(tag)}
            style={{ marginLeft: '5px', background: '#444', padding: '1px' }}
          >
            Note
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      <Spin tip="Loading..." spinning={loading}>
        <div ref={containerRef}>{renderTags()}</div>
        <Modal
          title="Add"
          open={isModalOpen}
          footer={null}
          onCancel={handleCancel}
        >
          <Form form={form} name="basic" onFinish={onFinish} autoComplete="off">
            <Form.Item
              label="Title"
              name="title"
              rules={[
                {
                  required: true,
                  message: 'Please input title',
                },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Note"
              name="article"
              rules={[
                {
                  required: true,
                  message: 'Please input note!',
                },
              ]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 16,
                span: 4,
              }}
            >
              <div style={{ display: 'flex' }}>
                <Button
                  htmlType="button"
                  style={{ marginRight: '15px' }}
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
        <Modal
          title="Note"
          open={isModalOpen1}
          footer={null}
          onCancel={handleCancel1}
        >
          <Form
            form={form1}
            name="basic1"
            onFinish={onFinish1}
            autoComplete="off"
          >
            <Form.Item
              label="Note"
              name="note"
              rules={[
                {
                  required: true,
                  message: 'Please input note!',
                },
              ]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>
            <Form.Item
              wrapperCol={{
                offset: 16,
                span: 4,
              }}
            >
              <div style={{ display: 'flex' }}>
                <Button
                  htmlType="button"
                  style={{ marginRight: '15px' }}
                  onClick={handleCancel1}
                >
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" loading={loading}>
                  Submit
                </Button>
              </div>
            </Form.Item>
          </Form>
        </Modal>
        <Layout>
          <Header
            style={{
              paddingLeft: 24,
              background: colorBgContainer,
            }}
          >
            <div className="home-action-content">
              {/* 登出按钮 */}
              <Popconfirm
                title="Sign out"
                description="Are you sure to sign out?"
                onConfirm={loginOut}
                okText="Yes"
                cancelText="No"
              >
                <span className="sign-out">Sign Out</span>
              </Popconfirm>
            </div>
          </Header>

          <div
            style={{
              marginTop: '16px',
              padding: 24,
              minHeight: '83vh',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Row>
              <Col span={14}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <Button
                    type="primary"
                    icon={<FileAddOutlined />}
                    style={{ marginBottom: '24px' }}
                    onClick={showModal}
                  >
                    Add Note
                  </Button>
                  <div>
                    {data[selected]?.article && (
                      <Popconfirm
                        description="Are you sure to delete this note?"
                        onConfirm={deleteNote}
                        okText="Yes"
                        cancelText="No"
                      >
                        <Button danger style={{ marginBottom: '24px' }}>
                          Delete Note
                        </Button>
                      </Popconfirm>
                    )}
                  </div>
                </div>
              </Col>
            </Row>
            <div>
              <Tabs defaultActiveKey="1" items={tabs} onChange={onTabChange} />
            </div>

            <Row>
              <Col span={14}>
                <div
                  style={{
                    textAlign: 'center',
                    marginBottom: '16px',
                    fontSize: '25px',
                  }}
                >
                  {data[selected]?.title}
                </div>
                <div className="article-content">
                  <pre>
                    <div id="article-select">{data[selected]?.article}</div>
                  </pre>
                </div>
              </Col>
              <Col
                span={9}
                offset={1}
                style={{ overflowY: 'auto', height: '70vh', marginTop: '50px' }}
              >
                <Space direction="vertical" size={16}>
                  <Collapse
                    style={{ width: '300px' }}
                    items={[
                      {
                        key: '1',
                        label: 'Instruction',
                        children: (
                          <div>
                            <div>1.Copy and paste job descriptions onto the job search platform.</div>
                            <div>2.Click on "Add Note" in the upper left corner.</div>
                            <div>3.Enter the job title and description separately.</div>
                            <div>4.When content is highlighted, options to delete and add notes will appear.</div>
                            <div>5.Select the "Add Note" option to access the annotation function.</div>
                            <div>6.You can delete or edit comment boxes as needed on the right side.</div>

                          </div>
                        ),
                      },
                    ]}
                  />
                  {note.map((item, index) => (
                    <div className="note-card" key={index}>
                      <div className="note-head">
                        <span className="note-title">{item.text}</span>
                        <span>
                          <EditTwoTone
                            onClick={() => editText(item)}
                            style={{
                              fontSize: '20px',
                              marginRight: '15px',
                              cursor: 'pointer',
                            }}
                          />
                          <Popconfirm
                            title="Delete the Note"
                            description="Are you sure to delete this note?"
                            onConfirm={() => confirm(item)}
                            okText="Yes"
                            cancelText="No"
                          >
                            <CloseCircleTwoTone style={{ fontSize: '25px' }} />
                          </Popconfirm>
                        </span>
                      </div>
                      <div>{item?.note}</div>
                    </div>
                    // <Card
                    //   id={item?.highlighterId}
                    //   key={index}
                    //   extra={
                    //     <Dropdown
                    //       menu={{
                    //         items,
                    //         onClick: (e) => handleMenuClick(e, index),
                    //       }}
                    //     >
                    //       <a onClick={(e) => e.preventDefault()}>
                    //         <Space>
                    //           Hover
                    //           <DownOutlined />
                    //         </Space>
                    //       </a>
                    //     </Dropdown>
                    //   }
                    //   style={{
                    //     width: 400,
                    //   }}
                    // >
                    //   {item?.tagData?.length == 0 && (
                    //     <Empty description={false} />
                    //   )}
                    //   {item?.tagData?.map((item, key) => (
                    //     <Card
                    //       key={key}
                    //       style={{
                    //         marginBottom: '10px',
                    //       }}
                    //       type="inner"
                    //       title={
                    //         <span
                    //           style={{
                    //             color:
                    //               item.type == 1
                    //                 ? '#f50'
                    //                 : item.type == 2
                    //                 ? '#2db7f5'
                    //                 : '#87d068',
                    //           }}
                    //         >
                    //           {item.type == 1
                    //             ? 'Confusing'
                    //             : item.type == 2
                    //             ? 'Embrrassing'
                    //             : 'Important'}
                    //         </span>
                    //       }
                    //       extra={
                    //         <div>
                    //           <EditTwoTone
                    //             onClick={() => editText(index, key)}
                    //             style={{
                    //               fontSize: '20px',
                    //               marginRight: '15px',
                    //               cursor: 'pointer',
                    //             }}
                    //           />
                    //           <Popconfirm
                    //             title="Delete the task"
                    //             description="Are you sure to delete this task?"
                    //             onConfirm={() => confirm(index, key)}
                    //             okText="Yes"
                    //             cancelText="No"
                    //           >
                    //             <CloseCircleTwoTone
                    //               style={{
                    //                 fontSize: '20px',
                    //                 cursor: 'pointer',
                    //               }}
                    //             />
                    //           </Popconfirm>
                    //         </div>
                    //       }
                    //     >
                    //       {!item?.text && !item.isEdit && (
                    //         <Empty description={false} />
                    //       )}
                    //       {item?.text && !item.isEdit && (
                    //         <div>{item?.text}</div>
                    //       )}
                    //       {item.isEdit && (
                    //         <div>
                    //           <TextArea
                    //             value={text}
                    //             rows={4}
                    //             onChange={(e) => textChange(e)}
                    //           />
                    //           <div
                    //             style={{
                    //               display: 'flex',
                    //               justifyContent: 'flex-end',
                    //               marginTop: '15px',
                    //             }}
                    //           >
                    //             <Button
                    //               type="primary"
                    //               style={{ marginRight: '10px' }}
                    //               onClick={() => submit(index, key)}
                    //             >
                    //               Submit
                    //             </Button>
                    //             <Button onClick={() => cancelEdit(index, key)}>
                    //               Cancel
                    //             </Button>
                    //           </div>
                    //         </div>
                    //       )}
                    //     </Card>
                    //   ))}
                    // </Card>
                  ))}
                </Space>
              </Col>
            </Row>
          </div>
        </Layout>
      </Spin>
    </>
  );
}
