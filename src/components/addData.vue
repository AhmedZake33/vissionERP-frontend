<template>
    <v-app>
        <div class="main" v-if="$route.params.id == 1">
            <div class="addForm">
                <h2>ط¥ط¶ط§ظپظ‡ ط·ظپظ„ ط¬ط¯ظٹط¯</h2>
                <div class="heading">
                     <div class="numberCard">1</div> 
                    <div class="text additionalText">
                        ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ط§ظˆظ„ظٹظ‡ ظ„ظ„ط­ط§ظ„ظ‡ 
                    </div>

                    <div class="numberCard">2</div> 
                    <div class="text additionalText">
                        ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„طھظپطµظٹظ„ظٹظ‡  
                    </div>

                    <div class="numberCard">3</div> 
                    <div class="text additionalText">
                          طھط§ط±ظٹط® ط§ظ„ط­ط§ظ„ظ‡ 
                    </div>

                    <div class="numberCard">4</div> 
                    <div class="text additionalText">
                        ط§ظ„ظ…ط´ط§ظƒظ„   
                    </div>

                    <div class="numberCard">5</div> 
                    <div class="text additionalText">
                         ط¨ظٹط§ظ†ط§طھ ط§ظ„ط§ط³ط±ظ‡  
                    </div>

                    <div class="numberCard">6</div> 
                    <div class="text additionalText">
                        ط§ظ„ظ…ظ‡ط§ط±ط§طھ
                    </div>

                </div>
                <div class="data">
                    <div class="initData div" v-if="type == 0">
                        <v-form>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ط³ظ… ط§ظ„ط·ظپظ„ :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span> ظ‡ط§طھظپ ط§ظ„ظ…ظ†ط²ظ„ :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>

                             <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط±ظ‚ظ… ط§ظ„ظ…ظ„ظپ  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>  ط±ظ‚ظ… ط§ظ„ظ…ط­ظ…ظˆظ„ :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                             <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>طھط§ط±ظٹط® ط§ظ„ظ…ظٹظ„ط§ط¯  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>  ظ†ظˆط¹ ط§ظ„ط§ط¹ط§ظ‚ظ‡ :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                             <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span> ط§ظ„ط¹ظ…ط± :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span> ظ…ط¯ط®ظ„ ط§ظ„ط¨ظٹط§ظ†ط§طھ  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                             <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ظ…ط­ظ„ ط§ظ„ظ…ظٹظ„ط§ط¯  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                
                            </v-row>


                            <v-btn
                            @click="nextInit"
                            depressed
                            color="primary"
                            >
                            ط§ظ„طھط§ظ„ظٹ
                            </v-btn>

                            
                        </v-form>
                    </div>

                    <div class="div" v-if="type == 1">
                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ظƒظˆط¯ ط§ظ„ط§ط¹ط§ظ‚ظ‡</span>
                                <v-text-field
                                    solo
                                ></v-text-field>
                            </v-col>
                        </v-row>
                         <v-row>
                            <v-col cols="12" md="6">
                                <span>ظˆطµظپ ط§ظ„ط§ط¹ط§ظ‚ظ‡</span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>
                         <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„ط®ط¯ظ…ط§طھ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„ط®ط¯ظ…ط§طھ ط§ظ„ط§ط¶ط§ظپظٹظ‡ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                            <v-btn color="primary" @click="nextDetails">ط§ظ„طھط§ظ„ظٹ</v-btn>
                    </div>

                    <div class="div" v-if="type == 2">
                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط­ط¯ظˆط« ط§ظ„ط§ط¹ط§ظ‚ظ‡</span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ‚ط¨ظ„ ط§ظ„ظˆظ„ط§ط¯ظ‡"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ط§ط«ظ†ط§ط، ط§ظ„ظˆظ„ط§ط¯ظ‡"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                     <v-radio
                                        label="ط¨ط¹ط¯ ط§ظ„ظˆظ„ط§ط¯ظ‡"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                          <v-row>
                            <v-col cols="12" md="6">
                                <span>ط³ط¨ط¨ ط§ظ„ط§ط¹ط§ظ‚ظ‡</span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                        <v-row>
                           
                            <v-col cols="12" md="6">
                                <span>ط¹ظ…ط± ط§ظ„ظˆط§ظ„ط¯ظٹظ† ط¹ظ†ط¯ ط§ظ„ظˆظ„ط§ط¯ظ‡</span>
                                <v-row>
                                    <v-col cols="4" sm="2">ط§ظ„ط§ط¨</v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>

                                </v-row>
                                 <v-row>
                                    <v-col cols="4" sm="2">ط§ظ„ط§ظ…</v-col>
                                    <v-col cols="12" sm="6" md="4">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>

                                </v-row>
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6">
                                <span> ظ‡ظ„ ط§ظ„طھط­ظ‚ ط§ظ„ط·ظپظ„ ط¨ظ…ط¤ط³ط³ظ‡ طھط¹ظ„ظٹظ…ظٹظ‡</span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>


                         <v-row>
                            <v-col cols="12" md="6">
                                <span> ظ‡ظ„ ظ„ط¯ظٹ ط§ظ„ط·ظپظ„ ظ…ط´ط§ظƒظ„ ط³ظ„ظˆظƒظٹظ‡   </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>


                          <v-btn color="primary" @click="toProblem">ط§ظ„طھط§ظ„ظٹ</v-btn>
                    </div>

                    <div class="problems div" v-if="type == 3">
                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ظ‡ظ„ ظٹط¹ط§ظ†ظٹ ظ…ظ† ظ…ط´ط§ظƒظ„ طµط­ظٹظ‡ </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <span>ظ‡ظ„  ظ„ط¯ظٹظ‡ ط§ط¹ط§ظ‚ظ‡ ط¹ظ‚ظ„ظٹظ‡   </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ظ‡ظ„ ظ„ط¯ظٹظ‡ ظ…ط´ط§ظƒظ„ ظپظٹ ط§ظ„ط³ظ…ط¹ ط§ظˆ ط§ظ„ط§ط¨طµط§ط±    </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <span>ظ‡ظ„ ظ„ط¯ظٹظ‡ ط§ط¹ط§ظ‚ط§طھ ط§ط®ط±ظٹ    </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <span>ظ‡ظ„ ظ„ط¯ظٹظ‡ ط­ط³ط§ط³ظٹظ‡ ظ…ظ† ط¨ط¹ط¶ ط§ظ„ط§ط·ط¹ظ…ظ‡    </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <span>ظ‡ظ„  ظ„ط¯ظٹظ‡ ط­ط³ط§ط³ظٹظ‡ طµط¯ط±ظٹظ‡ ط§ظˆ ط¬ظ„ط¯ظٹظ‡   </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <span>ظ‡ظ„ ظٹطھظ†ط§ظˆظ„ ط§ظ„ط§ط¯ظˆظٹظ‡    </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <span>ظ‡ظ„  ظٹط¹ط§ظ†ظٹ ظ…ظ† ط§ظ„طھط´ظ†ط¬ط§طھ   </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                        <v-btn color="primary" @click="toFamily">ط§ظ„طھط§ظ„ظٹ</v-btn>
                    </div>

                    <div class="family div" v-if="type == 4">
                        <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span>ط§ط³ظ… ظˆظ„ظٹ ط§ظ„ط§ظ…ط± :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span> ط§ظ„ط¹ظ…ط±  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span>طµظ„ظ‡ ط§ظ„ظ‚ط±ط§ط¨ظ‡   :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                        <span> ط±ظ‚ظ… ط§ظ„ظ…ط­ظ…ظˆظ„  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span>ط§ظ„ظ…ظ‡ظ†ظ‡   :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="6" md="4">
                                            <span> ط§ظ„ظ…ط³طھظˆظٹ ط§ظ„طھط¹ظ„ظٹظ…ظٹ  :</span>
                                    </v-col>
                                    <v-col cols="12" sm="5">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span>ظ‡ط§طھظپ ط§ظ„ط¹ظ…ظ„   :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span> ط¹ظ†ظˆط§ظ† ط§ظ„ط¹ظ…ظ„  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span>ط§ط³ظ… ط§ظ„ط§ظ…  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span> ط§ظ„ط¹ظ…ط±  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span>ظ…ظ†ط·ظ‚ظ‡ ط§ظ„ط³ظƒظ†    :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span> ط±ظ‚ظ… ط§ظ„ظ…ط­ظ…ظˆظ„  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span>ط§ظ„ظ…ظ‡ظ†ظ‡   :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span> ط§ظ„ظ…ط³طھظˆظٹ ط§ظ„طھط¹ظ„ظٹظ…ظٹ  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span>ظ‡ط§طھظپ ط§ظ„ط¹ظ…ظ„   :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span> ط¹ظ†ظˆط§ظ† ط§ظ„ط¹ظ…ظ„  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span>ط¹ط¯ط¯ ط§ظ„ط§ط®ظˆظ‡   :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                            <span> طھط±طھظٹط¨ ط§ظ„ط·ظپظ„  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span> ظ‡ظ„ ظٹظˆط¬ط¯ طµظ„ظ‡ ظ‚ط±ط§ط¨ظ‡ ط¨ظٹظ† ط§ظ„ظˆط§ظ„ط¯ظٹظ†   </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    
                                 </v-radio-group>  
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span> ظ‡ظ„ ظٹظˆط¬ط¯ ط§ظ…ط±ط§ط¶ ظ…ط²ظ…ظ†ظ‡ ظپظٹ ط§ظ„ط§ط³ط±ظ‡      </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    
                                 </v-radio-group>  
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span> ظ‡ظ„ ظٹظˆط¬ط¯ ط­ط§ظ„ط§طھ ظ…ظ…ط§ط«ظ„ظ‡ ظپظٹ ط§ظ„ط§ط³ط±ظ‡      </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظ†ط¹ظ… "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ظ„ط§ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    
                                 </v-radio-group>  
                            </v-col>
                        </v-row>
                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ظ„طھظˆط¶ظٹط­ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="3"
                                row-height="25"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span> ظˆط³ظٹظ„ظ‡ ط§ظ„ظ†ظ‚ظ„ </span>
                                 <v-radio-group
                                    column
                                    >
                                    <v-radio
                                        label="ظˆظ„ظٹ ط§ظ…ط± "
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                     <v-radio
                                        label="ط³ط§ط¦ظ‚ ط®ط§طµ "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                      <v-radio
                                        label="ط­ط§ظپظ„ظ‡ ط§ظ„ظ…ط±ظƒط²  "
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    
                                 </v-radio-group>  
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                        <span>ط§ط³ظ… ط§ظ„ط³ط§ط¦ظ‚  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                        </v-row>

                         <v-row>
                            <v-col cols="12" md="6">
                                <v-row>
                                    <v-col cols="12" sm="4">
                                        <span>ط¬ظˆط§ظ„ ط§ظ„ط³ط§ط¦ظ‚  :</span>
                                    </v-col>
                                    <v-col cols="12" md="6">
                                        <v-text-field
                                            solo
                                        ></v-text-field>
                                    </v-col>
                                </v-row> 
                            </v-col>
                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                    
                                <span>ط§ظ„ط¯ط®ظ„ ط§ظ„ط´ظ‡ط±ظٹ</span>                  
                                <v-radio-group
                                column
                                >
                                <v-radio
                                    label="ط¶ط¹ظٹظپ ط§ظ‚ظ„ ظ…ظ† 3000 ط§ظ„ط§ظپ "
                                    color="#10a29b"
                                    value="1"
                                ></v-radio>
                                    <v-radio
                                    label="ط¬ظٹط¯ 3000-5000 "
                                    color="#10a29b"
                                    value="2"
                                ></v-radio>
                                    <v-radio
                                    label=" ط¬ظٹط¯ ط¬ط¯ط§ 5000-10000 "
                                    color="#10a29b"
                                    value="3"
                                ></v-radio>
                                    <v-radio
                                    label="ظ…ظ…طھط§ط² ط§ظƒط«ط± ظ…ظ† 10000"
                                    color="#10a29b"
                                    value="4"
                                ></v-radio>   
                                </v-radio-group>  
                            </v-col>
                        </v-row>

                        <v-btn color="primary" @click="toSkills">ط§ظ„طھط§ظ„ظٹ</v-btn>
                   

                    </div>

                    <div class="skills div" v-if="type == 5">
                        <span> ط§ظ„ظ…ظ‡ط§ط±ط§طھ ط§ظ„ط§ط¬طھظ…ط§ط¹ظٹظ‡ : </span>
                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظٹط´ط§ط±ظƒ ط§ظ‚ط±ط§ظ†ظ‡ ظپظٹ ط§ظ„ظ„ط¹ط¨</h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5> ظ‡ظ„ ظٹط´ط§ط±ظƒ ط§ظ„ط·ظپظ„ ط§ط³ط±طھظ‡   </h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظٹط³طھط¬ظٹط¨ ظ„ظ„ظ…ط¤ط«ط±ط§طھ ط§ظ„ط§ط¬طھظ…ط§ط¹ظٹظ‡</h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظٹظ‚ظ„ط¯ ط­ط±ظƒط§طھ ط§ظ„ط§ط®ط±ظٹظ†  </h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <span> ط§ظ„ظ…ظ‡ط§ط±ط§طھ ط§ظ„ط§ط¯ط±ط§ظƒظٹظ‡ : </span>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظٹط¯ط±ظƒ ط¨ظ†ظپط³ظ‡    </h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظٹط¯ط±ظƒ ظˆط§ظ„ط¯ظٹظ‡/ط§ط®ظˆطھظ‡/ط§ظ„ظ…ط±ط¨ظٹظ‡</h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5> ظٹط¯ط±ظƒ ط§ظ„ط§ط´ظٹط§ط، ط§ظ„ظ…ط­ظٹط·ظ‡ ظ…ظ† ط­ظˆظ„ظ‡</h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5> ظٹطھط¹ط±ظپ ط¹ظ„ظٹ طµظˆط± ط§ظ„ط§ط´ظٹط§ط، ط§ظ„ظ…ط­ظٹط·ظ‡ ظ…ظ† ط­ظˆظ„ظ‡  </h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <span> ط§ظ„ظ…ظ‡ط§ط±ط§طھ ط§ظ„ط§طھطµط§ظ„ظٹظ‡ : </span>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>  ط§ظ„طھظˆط§طµظ„ ط§ظ„ط¨طµط±ظٹ </h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>  ط§ظ„ظ„ط؛ظ‡ ط§ظ„ط§ط³طھظ‚ط¨ط§ظ„ظٹظ‡  </h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <span>ط§ظ„ظ…ظ‡ط§ط±ط§طھ ط§ظ„ط­ط±ظƒظٹظ‡ :</span>
                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظٹط´ط§ط±ظƒ ط§ظ‚ط±ط§ظ†ظ‡ ظپظٹ ط§ظ„ظ„ط¹ط¨</h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5> ظ‡ظ„ ظٹط´ط§ط±ظƒ ط§ظ„ط·ظپظ„ ط§ط³ط±طھظ‡   </h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظٹط³طھط¬ظٹط¨ ظ„ظ„ظ…ط¤ط«ط±ط§طھ ط§ظ„ط§ط¬طھظ…ط§ط¹ظٹظ‡</h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                               
                                <h5>ظٹظ‚ظ„ط¯ ط­ط±ظƒط§طھ ط§ظ„ط§ط®ط±ظٹظ†  </h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ط¹ظ…"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ„ط§"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                   <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ†ظˆط¹ط§ ظ…ط§"
                                        color="#10a29b"
                                        value="3"
                                    ></v-radio>
                                    </v-col>
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <span>ط§ظ„ظ…ط³ط§ط¹ط¯ظ‡ ط§ظ„ط°ط§طھظٹظ‡  :</span>

                        
                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظٹط´ط§ط±ظƒ ط§ظ‚ط±ط§ظ†ظ‡ ظپظٹ ط§ظ„ظ„ط¹ط¨</h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ…ط³طھظ‚ظ„"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ط¨ظ…ط³ط§ط¹ط¯ظ‡"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظ‡ظ„ ظٹط´ط§ط±ظƒ ط§ظ„ط·ظپظ„ ط§ط³ط±طھظ‡</h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ…ط³طھظ‚ظ„"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ط¨ظ…ط³ط§ط¹ط¯ظ‡"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظٹط³طھط¬ظٹط¨ ظ„ظ„ظ…ط¤ط«ط±ط§طھ ط§ظ„ط§ط¬طھظ…ط§ط¹ظٹظ‡   </h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ…ط³طھظ‚ظ„"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ط¨ظ…ط³ط§ط¹ط¯ظ‡"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" sm="4">
                                <h5>ظٹظ‚ظ„ط¯ ط­ط±ظƒط§طھ ط§ظ„ط§ط®ط±ظٹظ†   </h5>
                            </v-col>
                            <v-col cols="9">
                                <v-radio-group
                                    column
                                >
                                <v-row>
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ظ…ط³طھظ‚ظ„"
                                        color="#10a29b"
                                        value="1"
                                    ></v-radio>
                                    </v-col>
                                   
                                    <v-col cols="4" sm="2">
                                        <v-radio
                                        label="ط¨ظ…ط³ط§ط¹ط¯ظ‡"
                                        color="#10a29b"
                                        value="2"
                                    ></v-radio>
                                    </v-col>
                                    
                                      
                                </v-row>
                               </v-radio-group>  
                            </v-col>

                        </v-row>

                        <v-row>
                            <v-col cols="12" md="6">
                                <span>ط§ط°ظƒط± ط¨ط¹ط¶ ط§ظ„ظ…ط¹ط²ط²ط§طھ ظ„ط¯ظٹ ط§ظ„ط·ظپظ„ </span>
                                <v-textarea
                                auto-grow
                                outlined
                                rows="5"
                                row-height="30"
                            ></v-textarea>
                            </v-col>
                        </v-row>

                        <v-btn color="#10a29b" style="color:white" 
                        @click="addChild">ط¥ط¶ط§ظپظ‡</v-btn>



                    </div>


                    <div class="div final" v-if="type == 6" >
                      
                        <div class="contentDiv">
                              <h3>طھظ… ط§ط¶ط§ظپظ‡ ط§ظ„ط·ظپظ„ ط¨ظ†ط¬ط§ط­</h3><br>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-btn @click="showAll" style="color:white" class="showAll" color="#10a29b">ط¹ط±ط¶ ظ‚ط§ط¦ظ…ظ‡ ط§ظ„ط§ط·ظپط§ظ„</v-btn>
                                </v-col>

                                <v-col cols="12" md="6">
                                    <v-btn @click="addNew" style="border-color:#10a29b;color:#10a29b" class="addNew" outlined> ط¥ط¶ط§ظپظ‡ ط·ظپظ„ ط¬ط¯ظٹط¯  </v-btn>
                                </v-col>
                        </v-row>
                        </div>
                      
                    </div>
                </div>  
            </div>
        </div>

        <div class="main" v-if="$route.params.id == 2">
            <div class="addForm" v-if="!showSuccess">
                <h2>ط¥ط¶ط§ظپظ‡ ظ…ط¯ط±ط³ظ‡</h2>
                <div class="header">
                    <h3>ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ط¯ط±ط³ظ‡ ط§ظ„ظ…ط±ط§ط¯ ط§ط¶ط§ظپطھظ‡ط§</h3>
                </div>
                <div class="data">
                 <div class="initData div">
                        <v-form>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ظ„ظƒظˆط¯  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span> ط§ظ„ط§ط³ظ… ط¨ط§ظ„ط§ظ†ط¬ظ„ظٹط²ظٹظ‡  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>

                             <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ظ„ط§ط³ظ… ط¨ط§ظ„ط¹ط±ط¨ظٹ   :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>  ط§ظ„ظ…ط±ط­ظ„ظ‡  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                             <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط§ظ„ظƒطھط±ظˆظ†ظٹ   :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>  ط§ظ„ظ‡ط§طھظپ  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                             <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="5">
                                             <span> ظ†ظˆط¹ ط§ظ„ظ…ط¤ط³ط³ظ‡ ط§ظ„طھط¹ظ„ظٹظ…ظٹظ‡ :</span>
                                        </v-col>
                                        <v-col cols="12" sm="6" md="4">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span> ظ†ظˆط¹ ط§ظ„طھط±ط®ظٹطµ   :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                             <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ظ„ط¨ظ„ط¯   :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ظ„ظ…ط¯ظٹظ†ظ‡   :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                
                            </v-row>

                              <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ظ„ظ…ظ†ط·ظ‚ظ‡   :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ظ„ط´ط§ط±ط¹   :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                
                            </v-row>


                              <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ظ„ط¹ظ†ظˆط§ظ† ظ…ظپطµظ„   :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-textarea
                                            auto-grow
                                            outlined
                                            rows="2"
                                            row-height="15"
                                        ></v-textarea>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ظ…ط¯ظٹط± ط§ظ„ط§ط¯ط§ط±ظ‡   :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                
                            </v-row>


                            <v-btn
                            @click="saveSchool"
                            depressed
                            color="primary"
                            >
                            ط­ظپط¸
                            </v-btn>
                        </v-form>
                    </div>
                </div> 
            </div>
            <div class="div final" v-if="showSuccess">
            <div class="contentDiv">
                    <h3>طھظ… ط§ط¶ط§ظپظ‡ ط§ظ„ظ…ط¤ط³ط³ظ‡ ط¨ظ†ط¬ط§ط­</h3><br>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-btn @click="showSchools" style="color:white" class="showAll" color="#10a29b">ط¹ط±ط¶ ظ‚ط§ط¦ظ…ظ‡ ط§ظ„ظ…ط¤ط³ط³ط§طھ</v-btn>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-btn @click="addNew" style="border-color:#10a29b;color:#10a29b" class="addNew" outlined> ط¥ط¶ط§ظپظ‡ ظ…ط¤ط³ط³ظ‡ ط¬ط¯ظٹط¯  </v-btn>
                    </v-col>
            </v-row>
            </div>
                      
            </div>

        </div>

        <div class="main" v-if="$route.params.id == 3">
            <div class="addForm" v-if="!showSuccessSpecialist">
                <h2>ط¥ط¶ط§ظپظ‡ ظ…طھط®طµطµ</h2>
                <div class="header">
                    <h3> ظ…ط³طھط®ط¯ظ… ط¬ط¯ظٹط¯  </h3>
                </div>
                <div class="data">
                 <div class="initData div">
                        <v-form>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ…  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span> ط§ظ„ظ…ط³ظ…ظٹ ط§ظ„ظˆط¸ظٹظپظٹ   :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>

                             <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ظ„ط¨ط±ظٹط¯ ط§ظ„ط§ظ„ظƒطھط±ظˆظ†ظٹ    :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>  ظƒظ„ظ…ظ‡ ط§ظ„ظ…ط±ظˆط±  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                             <v-row>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>ط§ظ„طµظ„ط§ط­ظٹط§طھ :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-select
                                                multiple=""
                                                :items="[' admin','user']"
                                                outlined
                                            ></v-select>
                                        </v-col>
                                    </v-row> 
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span>  طھط£ظƒظٹط¯ ظƒظ„ظ…ظ‡ ط§ظ„ظ…ط±ظˆط±  :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                             <v-row>
                               
                                <v-col cols="12" md="6">
                                    <v-row>
                                        <v-col cols="12" sm="4">
                                             <span> ط§ظ„ظ‡ط§طھظپ :</span>
                                        </v-col>
                                        <v-col cols="12" md="6">
                                            <v-text-field
                                                solo
                                            ></v-text-field>
                                        </v-col>
                                    </v-row>
                                </v-col>
                            </v-row>
                            


                            <v-btn
                            @click="saveSpecialist"
                            depressed
                            color="primary"
                            >
                            ط­ظپط¸
                            </v-btn>
                        </v-form>
                    </div>
                </div> 
            </div>
            <div class="div final" v-if="showSuccessSpecialist">
            <div class="contentDiv">
                    <h3>طھظ… ط§ط¶ط§ظپظ‡ ط§ظ„ظ…طھط®طµطµ ط¨ظ†ط¬ط§ط­</h3><br>
                <v-row>
                    <v-col cols="12" md="6">
                        <v-btn @click="showSpecialist" style="color:white" class="showAll" color="#10a29b">ط¹ط±ط¶ ظ‚ط§ط¦ظ…ظ‡ ط§ظ„ظ…ط³طھط®ط¯ظ…ظٹظ†</v-btn>
                    </v-col>

                    <v-col cols="12" md="6">
                        <v-btn @click="addNew" style="border-color:#10a29b;color:#10a29b" class="addNew" outlined> ط¥ط¶ط§ظپظ‡ ظ…ط³طھط®ط¯ظ… ط¬ط¯ظٹط¯  </v-btn>
                    </v-col>
            </v-row>
            </div>
                      
        </div>
        </div>

        

        
       
    </v-app>
</template>


<script>
export default {

    data(){
        return {
            type:0,
            showSuccess:false,
            showSuccessSpecialist:false
        }
    },
    mounted(){
        console.log(document.getElementsByClassName('numberCard')[0]);
        console.log(document.getElementsByClassName('text')[0])
        let div = document.getElementsByClassName('numberCard')[0];
        let text = document.getElementsByClassName('text')[0];
        text.classList.add("activeText")
        div.classList.add("active")
    },
    methods:{
        nextInit(){
          this.type = 1
            let div = document.getElementsByClassName('numberCard')[1];
            let text = document.getElementsByClassName('text')[1];
            text.classList.add("activeText")
            div.classList.add("active")
        },
        nextDetails(){
            this.type = 2
            let div = document.getElementsByClassName('numberCard')[2];
            let text = document.getElementsByClassName('text')[2];
            text.classList.add("activeText")
            div.classList.add("active")
        },
        toProblem(){
            this.type = 3
            let div = document.getElementsByClassName('numberCard')[3];
            let text = document.getElementsByClassName('text')[3];
            text.classList.add("activeText")
            div.classList.add("active")
        },
        toFamily(){
            this.type = 4
            let div = document.getElementsByClassName('numberCard')[4];
            let text = document.getElementsByClassName('text')[4];
            text.classList.add("activeText")
            div.classList.add("active")
        },
        toSkills(){
            this.type = 5
            let div = document.getElementsByClassName('numberCard')[5];
            let text = document.getElementsByClassName('text')[5];
            text.classList.add("activeText")
            div.classList.add("active")
        },
        addChild(){
           this.type = 6
        },
        showAll(){
            this.$router.push('/mainComponent/'+1);
        },
        showSchools(){
            this.$router.push('/mainComponent/'+2);

        },
        saveSchool(){
            this.showSuccess = true;
        },
        addNew(){
            this.$router.go()
        },
        saveSpecialist(){
            this.showSuccessSpecialist = true
        },
        showSpecialist(){
            this.$router.push('/mainComponent/'+3);
        }
    }
    
}
</script>


<style scoped>

.main{
    margin-top: 1rem;
    padding: 0 1rem;
}

@media (min-width: 768px) {
    .main {
        padding: 0 2rem;
    }
}

@media (min-width: 1200px) {
    .main {
        padding: 0 3rem;
    }
}

.main .addForm .data {
    font-weight: bold;
    font-size: 1rem;
    direction: rtl;
}

@media (min-width: 576px) {
    .main .addForm .data {
        font-size: 1.125rem;
    }
}

.main .addForm .heading{
    font-weight: bold;
    font-size: 1.25rem;
    direction: rtl;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
}

@media (min-width: 768px) {
    .main .addForm .heading {
        font-size: 1.5rem;
    }
}

.main .addForm .header{
    min-height: auto;
    background-color: #fbfbfb;
    direction: rtl;
    padding: 1rem;
}

.main .addForm .body{
    display: flex;
    align-items: center;
    justify-content: center;
}

.main .addForm .numberCard{
    height: 1.5rem;
    width: 1.5rem;
    padding: 0.25rem;
    background-color: gray;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 21%;
    color: aliceblue;
    font-size: 0.875rem;
    flex-shrink: 0;
}

.main .addForm .active{
    background-color: #10a29b;
} 

.main .addForm .activeText{
    color:black
}

.main .addForm .text{
    display: inline;
    margin-inline-end: 1rem;
}

main .addForm .additionalText{
     color:gray;
}

.main .addForm .div{
    margin-top: 1rem;
    margin-bottom: 0.5rem;
}

.main .addForm .initData .right{
    float: right;
    border:1px solid black
}

.main .addForm .initData .left{
    float: left;
    border:1px solid black
}

.main .addForm h2{
    font-weight: bold;
    margin-bottom: 0.5rem;
    direction: rtl;
}

.main .final {
    display: flex;
    align-items: center;
    justify-content: center;
}

.main .final h3{
    color:black;
    text-align: center;
}

.main .final .contentdiv{
    text-align: center;
}


</style>
