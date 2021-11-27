import { useState } from "react";
import "../assets/css/ImageUpload.css";
import { S3Config, UploadS3 } from "./UploadS3";
import axios from "axios";
import sha256 from "sha256";
import { Container, Row, Col, Button } from "react-bootstrap";
import { css } from "@emotion/react";
import ClockLoader from "react-spinners/ClockLoader";

const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

const UploadImage = () => {
    const [gender, setGender] = useState(0);
    const [loading, setLoading] = useState(false);
    const [contents, setContents] = useState(null);
    const [hash, setHash] = useState(null);
    const [state, setState] = useState(null);

    const onSubmit = (event) => {
        let hashed = gender + sha256(state.name);
        console.log("hashed", hashed);
        const body = {
            userId: hashed,
            imageUrl: `https://${S3Config.bucketName}.s3.${S3Config.region}.amazonaws.com/${state.name}`,
        };
        console.log(body);

        UploadS3([state]);
        setLoading(true);
        setHash(hashed);
        axios
            .post("/producer", body)
            .then((response) => {
                alert("업로드 성공");
            })
            .catch((e) => {
                setHash(null);
                alert("업로드 실패");
            });
        return hashed;
    };

    const checkFileSize = (file) => {
        console.log(file);
        console.log(file.lastModified);
        console.log(file.size);
        if (file.size < 224 * 224) {
            alert("파일 사이즈가 너무 작아요");
            return false;
        }

        return file;
    };

    const onResult = async (event, hash) => {
        let find = false;
        const _sleep = (delay) =>
            new Promise((resolve) => setTimeout(resolve, delay));

        for (let i = 0; i < 10; i++) {
            if (!find) {
                console.log("반복");
                await _sleep(1000);
                axios
                    .get(`/api/v1/info/${hash}`)
                    // .get(`/api/v1/info/11`)
                    .then((response) => {
                        find = true;
                        console.log(response);
                        let payload = response.data.payload;

                        setContents(
                            <div>
                                <p>강아지: {payload.dog} </p>
                                <p>고양이: {payload.cat} </p>
                                <p>토끼: {payload.rabbit} </p>
                                <p>곰: {payload.bear} </p>
                                <p>공룡: {payload.dino} </p>
                                <p>여우: {payload.fox} </p>
                            </div>
                        );

                        setLoading(false);
                    });
            }
            if (find) {
                break;
            }
        }
        setLoading(false);
        if (!find) {
            alert("Error: 관리자에게 문의하세요 ");
        } else {
            alert("결과를 가져왔어요!");
        }
    };

    const onClickHandler = (event) => {
        setState(null);
        setHash(null);
        setContents(null);
        setLoading(false);
        let checkedFile = checkFileSize(event.target.files[0]);
        if (checkedFile) setState(checkedFile);
    };

    return (
        <Container>
            <Row>
                <Col md={{ span: 3, offset: 0 }}>
                    <Button variant="primary">Primary</Button>{" "}
                    <span
                        class="filebox"
                        onClick={(event) => {
                            setGender(0);
                        }}
                    >
                        <label>남자</label>
                    </span>
                </Col>
                <Col md={{ span: 3, offset: 0 }}>
                    <Button>test1</Button>
                    <span
                        class="filebox"
                        onClick={(event) => {
                            setGender(1);
                        }}
                    >
                        <label>여자</label>
                    </span>
                </Col>
            </Row>

            <div class="filebox">
                <label for="ex_file">
                    {state ? "다른 사진으로 할래요?" : "사진을 업로드하세요"}
                </label>
                <input
                    type="file"
                    id="ex_file"
                    accept="image/*"
                    onChange={onClickHandler}
                    value=""
                />
            </div>
            <br />

            <div>
                {state && (
                    <img
                        id="output"
                        style={{ width: "100%" }}
                        src={URL.createObjectURL(state)}
                    />
                )}
                <br />
                {state && (
                    <div
                        class="filebox"
                        onClick={(event) => {
                            let flag = onSubmit(event);
                            console.log(flag);
                            if (flag) onResult(event, flag);
                            // if (flag) onResult(event, flag);
                        }}
                    >
                        <label>결과 확인하기</label>
                    </div>
                )}
                <br />
                {hash && (
                    <div>
                        {contents ? (
                            <div>{contents}</div>
                        ) : (
                            <div>
                                <ClockLoader
                                    color={"#555555"}
                                    loading={loading}
                                    css={override}
                                    size={60}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </Container>
    );
};

export default UploadImage;
